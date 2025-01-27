/**
 * fileUploadController.js
 * @description :: exports all method related file upload
 */

const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const AmazonS3URI = require('amazon-s3-uri');
const { S3Config, s3 } = require('../../../config/awsConfig');

let allowedFileTypes = [
  'png',
  'jpeg',
  'jpg',
  'gif',
  'pdf',
  'doc',
  'docx',
  'mp4',
  'msword',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls',
  'xlsx',
  'vnd.ms-excel',
  'json',
  'x-msdos-program',
  'x-msdownload',
  'exe',
  'x-ms-dos-executable'
];
let maxFileSize = 200; //In Megabyte

/**
 * @description : uploads file using formidable.
 * @param {Object} req : request of file upload API
 * @param {Object} res : response of file upload API.
 * @return {Object} : response of file upload. {status, message, data}
 */
const upload = async (req,res) => {
  try {
    // Setting up formidable options.
    const options = {
      multiples : true,
      maxFileSize : 300 * 1024 * 1024, //300 MB
      maxFieldsSize : 100 * 1024 * 1024 //50 MB
    };
    const form = new formidable.IncomingForm(options);

    const uploadFileRes = await new Promise(async (resolve, reject) => {
      form.parse(req, async function (error, fields, files) {
        
        if (error) {
          reject(error);
        }

        let uploadSuccess = [];
        let uploadFailed = [];
        let fileCount = 1;

        let fileArr = [];
        if (!files['files']) {
          reject({
            'message': 'Select at least one file to upload.',
            'name': 'validationError'
          });
        }
        if (!Array.isArray(files['files'])) {
          fileArr.push(files['files']);
          files['files'] = fileArr;
        }

        for (let file of files['files']) {
          // console.log("files: " , files['files']);
          if(file){
          let response = await uploadFiles(file,fields,fileCount++);
          console.log(response);
          if (response.status == false) {
            uploadFailed.push({
              'name': file.originalFilename,
              'error': response.message,
              'status': false
            });
          } else {
            uploadSuccess.push({
              'name': file.originalFilename,
              'path': response.data,
              'status': true
            });
          }
        }else{
          reject({
            'message': 'Select at least one file to upload.',
            'name': 'validationError'
          });
        }
        }

        resolve({
          uploadSuccess,
          uploadFailed
        });
      });
    });
    
    if (uploadFileRes.uploadSuccess.length > 0) {
      let message = `${uploadFileRes.uploadSuccess.length} File uploaded successfully out of ${uploadFileRes.uploadSuccess.length + uploadFileRes.uploadFailed.length}`;
      return res.success({
        message: message,
        data: uploadFileRes
      });
    } else {
      let message = 'Failed to upload files.';
      return res.failure({
        message: message,
        data: uploadFileRes
      });
    }
  } catch (error){
    if (error.name && error.name == 'validationError') {
      return res.validationError({ message: error.message });
    } else {
      return res.internalServerError({ message:error.message }); 
    }
  }
};

/**
 * @description : generate pre signed url for file
 * @param {string} uri : url of file
 * @return {Object} : response for generate pre signed url
 */
const generatePreSignedURL = async (req, res) => {
  try {
    if (req.body && req.body.uri) {
      let uri = req.body.uri;
      
      // Ensure that the URI starts with the DigitalOcean Spaces domain
      const bucketPrefix = 'https://techpyro-basic-bucket-1.sgp1.cdn.digitaloceanspaces.com/';
      if (uri.startsWith(bucketPrefix)) {
        let path = uri.substring(bucketPrefix.length); 
        
        const options = {
          Bucket: process.env.DO_S3_BUCKET_NAME,
          Key: path
          
        };

        await s3.getSignedUrl('getObject', options, (error, url) => {
          if (error) {
            return res.failure({ message: error.message });
          } else {
            return res.success({ data: url });
          }
        });
      } else {
        return res.failure({ message: `${uri} is not a valid DigitalOcean Space URL` });
      }
    } else {
      return res.badRequest({ message: 'Insufficient request parameters! URI is required.' });
    }
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : upload files
 * @param {Object} file : file to upload
 * @param {Object} fields : fields for file
 * @param {number} fileCount : total number of files to upload
 * @return {Object} : response for file upload
 */
const uploadFiles = async (file,fields,fileCount) => {
  let extension = path.extname(file.originalFilename);
  extension = extension.split('.').pop();
  fileType = file.mimetype;
  if (allowedFileTypes.length == 0 || !allowedFileTypes.includes(extension)) {
    return {
      status: false,
      message: 'Filetype not allowed.'
    };
  }

  // Check File Size
  const fileSize = ((file.size / 1024) / 1024);
  if (maxFileSize < fileSize) {
    return {
      status: false,
      message: `Allow file size upto ${maxFileSize} MB.`
    };
  }

  let fileName = file.originalFilename;
  //Create Requested Directory,if given in request parameter.
  if (fields && fields.folderName) {
    fileName = fields.folderName + '/' + fileName;
  }
  else if (fields && fields.fileName) {
    fileName = fields.fileName + '-' + fileCount + path.extname(file.originalFilename);
  }
  const response = await new Promise(async (resolve, reject) => {
    resolve(await uploadToS3(file,fileName));
  });
  return response;

};
/**
 * @description : upload file to AWS s3
 * @param {Object} file : file to upload
 * @param {string} fileName : name of file
 * @return {Object} : response for file upload to AWS s3
 */
const uploadToS3 = async (file, fileName) => {


  

  let params = {
    Bucket: process.env.DO_S3_BUCKET_NAME,
    Body: fs.createReadStream(file.filepath),
    Key: fileName,
    ACL: "public-read"
  };
  const response = await new Promise(async (resolve, reject) => {
    s3.putObject(params, function (error, data) {
      if (error) {
        resolve({
          status: false,
          message: error.message
        });
      } else {
        resolve({
          status: true,
          data:  'https://' + process.env.DO_S3_BUCKET_NAME + '.' + process.env.DO_S3_REGION + `.cdn.digitaloceanspaces.com/${process.env.DO_PATH}/` + fileName
        });
      }
    });
  });
  return response;
};
module.exports = {
  upload,
  generatePreSignedURL
};
