
const fs = require('fs');
const PART_SIZE = 50 * 1024 * 1024; 
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const { PassThrough } = require('stream');
const AmazonS3URI = require('amazon-s3-uri');
const { s3, S3Config } = require('../config/awsConfig');
const AWS = require('aws-sdk');
const setAclForFile = async (fileName) => {
  try {
    const params = {
      Bucket: process.env.DO_S3_BUCKET_NAME,
      Key: fileName,
      ACL: "public-read", 
    };

    await s3.putObjectAcl(params).promise();
    console.log(`ACL set to public-read for ${fileName}`);
  } catch (error) {
    console.error('Error setting ACL:', error.message);
    throw new Error('Failed to set ACL for file');
  }
};
/**
 * Start a multipart upload with error handling.
 * @param {string} fileName - File name for S3
 * @returns {Promise<string>} - Upload ID
 */
const startMultipartUpload = async (fileName) => {
  try {
    const params = {
      Bucket: process.env.DO_S3_BUCKET_NAME,
      Key: fileName,
    };

    const { UploadId } = await s3.createMultipartUpload(params).promise();
    return UploadId;
  } catch (error) {
    console.error('Error starting multipart upload:', error.message);
    throw new Error('Failed to start multipart upload');
  }
};


/**
 * Upload a file part to S3 using streaming with pipe method and error handling.
 * @param {string} filePath - Path to the local file
 * @param {string} uploadId - S3 Upload ID
 * @param {number} partNumber - Current part number
 * @param {string} fileName - File name in S3
 * @returns {Promise<string>} - ETag of the uploaded part
 */
const uploadPart = async (filePath, uploadId, partNumber, fileName) => {
  try {
    console.log(`Uploading part ${partNumber} of file ${fileName}...`);

    const start = (partNumber - 1) * PART_SIZE;
    const end = Math.min(partNumber * PART_SIZE, fs.statSync(filePath).size) - 1;
    const partSize = end - start + 1;

    const readStream = fs.createReadStream(filePath, { start, end });
    const passThroughStream = new PassThrough();

    const params = {
      Bucket: process.env.DO_S3_BUCKET_NAME,
      Key: fileName,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: passThroughStream,
      ContentLength: partSize,
    };

    const uploadPromise = s3.uploadPart(params).promise();

    // Pipe the readStream to passThroughStream
    readStream.pipe(passThroughStream);

    const { ETag } = await uploadPromise;
    console.log(`Successfully uploaded part ${partNumber}`);
    return ETag;
  } catch (error) {
    console.error(`Error uploading part ${partNumber}:`, error);
    throw new Error(`Failed to upload part ${partNumber}`);
  }
};


/**
 * Retry mechanism for uploading a part with exponential backoff.
 * @param {string} filePath - Path to the local file
 * @param {string} uploadId - S3 Upload ID
 * @param {number} partNumber - Current part number
 * @param {string} fileName - File name in S3
 * @param {number} retries - Number of retries if the upload fails
 * @returns {Promise<string>} - ETag of the uploaded part
 */
const uploadPartWithRetry = async (filePath, uploadId, partNumber, fileName, retries = MAX_RETRIES) => {
  try {
    return await uploadPart(filePath, uploadId, partNumber, fileName);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying part ${partNumber}... Attempts left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries)));
      return uploadPartWithRetry(filePath, uploadId, partNumber, fileName, retries - 1);
    }
    console.error(`Failed to upload part ${partNumber} after retries.`);
    throw error;
  }
};

/**
 * Complete multipart upload with error handling.
 * @param {string} uploadId - S3 Upload ID
 * @param {Array} parts - List of parts with PartNumber and ETag
 * @param {string} fileName - File name in S3
 * @returns {Promise<string>} - S3 file URL
 */
const completeMultipartUpload = async (uploadId, parts, fileName) => {
  try {
    const params = {
      Bucket: process.env.DO_S3_BUCKET_NAME,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
     
    };

    await s3.completeMultipartUpload(params).promise();
    console.log(`Multipart upload completed for ${fileName}`);
    await setAclForFile(fileName);
    const fileUrl = 'https://' + process.env.DO_S3_BUCKET_NAME + '.' + process.env.DO_S3_REGION + `.cdn.digitaloceanspaces.com/${process.env.DO_PATH}/` + fileName;
    return fileUrl;
 
  } catch (error) {
    console.error('Error completing multipart upload:', error.message);
    throw new Error('Failed to complete multipart upload');
  }
};

/**
 * List uploaded parts for resumption.
 * @param {string} uploadId - S3 Upload ID
 * @param {string} fileName - File name in S3
 * @returns {Promise<Array>} - List of uploaded parts
 */
const listUploadedParts = async (uploadId, fileName) => {
  try {
    const params = {
      Bucket: process.env.DO_S3_BUCKET_NAME,
      Key: fileName,
      UploadId: uploadId,
    };

    const { Parts } = await s3.listParts(params).promise();
    return Parts || [];
  } catch (error) {
    console.error('Error listing uploaded parts:', error.message);
    throw new Error('Failed to list uploaded parts');
  }
};





/**
 * Start or resume a multipart upload process.
 * @param {string} filePath - Path to the file being uploaded
 * @param {string} fileName - File name in S3
 * @returns {Promise<{message: string, fileUrl: string}>} - Upload status and file URL
 */
const startOrResumeMultipartUpload = async (filePath, fileName) => {
  try {
    
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const uploadId = await startMultipartUpload(uniqueFileName);

    const parts = await listUploadedParts(uploadId, uniqueFileName);

    const fileStats = fs.statSync(filePath);
    const totalParts = Math.ceil(fileStats.size / PART_SIZE);

    const uploadedParts = parts.map(({ PartNumber, ETag }) => ({ PartNumber, ETag }));
    const uploadedPartNumbers = uploadedParts.map((p) => p.PartNumber);

    const newParts = [];
    for (let i = 1; i <= totalParts; i++) {
      if (!uploadedPartNumbers.includes(i)) {
        const eTag = await uploadPartWithRetry(filePath, uploadId, i, uniqueFileName);
        newParts.push({ PartNumber: i, ETag: eTag });
      }
    }

    const allParts = [...uploadedParts, ...newParts];
    if (newParts.length > 0 || uploadedParts.length !== totalParts) {
      return {
        message: 'File upload completed successfully!',
        fileUrl: await completeMultipartUpload(uploadId, allParts, uniqueFileName),
      };
    }

    await setAclForFile(uniqueFileName);
    const fileUrl = 'https://' + process.env.DO_S3_BUCKET_NAME + '.' + process.env.DO_S3_REGION + `.cdn.digitaloceanspaces.com/${process.env.DO_PATH}/` + uniqueFileName;

    return { message: 'File already uploaded!', fileUrl };

  } catch (error) {
    console.error('Error during multipart upload:', error.message);
    throw new Error('Failed to complete multipart upload process');
  }
};

/**
 * @description : generate pre signed url for file
 * @param {string} uri : url of file
 * @return {Object} : response for generate pre signed url
 */




const generatePreSignedURL = async (req, res) => {
  try {
    const { uri } = req.body;
    if (!uri) {
      return res.status(400).json({ message: 'File URL is required in the request body.' });
    }

    // Parse bucket and key based on the provided DO_SPACES_URI
    const baseUri = process.env.DO_SPACES_URI; // Includes part of the folder path
    const basePath = baseUri.replace(/https?:\/\//, '').split('/'); // Split the base URI
    const bucket = basePath[0].split('.')[0]; // Extract bucket name from URI
    const prefixPath = basePath.slice(1).join('/'); // Extract prefix path

    // Remove base URI to extract the remaining key
    const key = uri.replace(`${baseUri}/`, '');

    // Add prefix path if required
    const objectKey = prefixPath ? `${prefixPath}/${key}` : key;

    const options = {
      Bucket: bucket,
      Key: objectKey,
      Expires: 900, // URL expiration time in seconds
      ResponseContentType: 'video/mp4',
      ResponseContentDisposition: 'inline',
    };

    const preSignedUrl = await s3.getSignedUrlPromise('getObject', options);

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Pre-signed URL generated successfully',
      data: preSignedUrl,
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return res.status(500).json({
      status: 'FAILURE',
      message: 'Error generating pre-signed URL',
      error: error.message,
    });
  }
};






module.exports = {
  startMultipartUpload,
  uploadPart,
  uploadPartWithRetry,
  completeMultipartUpload,
  listUploadedParts,
  startOrResumeMultipartUpload,
  generatePreSignedURL,
};
