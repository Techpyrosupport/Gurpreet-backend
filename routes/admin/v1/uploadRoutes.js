/**
 * uploadRoutes.js
 * @description :: routes of upload/download attachment
 */

const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const fileUploadController = require('../../../controller/admin/v1/fileUploadController');
const { catchAsync } = require('../../../utils/errorHandler');
const { startOrResumeMultipartUpload, generatePreSignedURL } = require('../../../services/s3VideoUplodar');
const multer = require('multer');

router.post('/upload',fileUploadController.upload);

router.post('/generate-pre-signed-url',fileUploadController.generatePreSignedURL);
router.post('/generate-pre-signed-video-url',generatePreSignedURL);

const uploadDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

/**
 * Route: /upload-video
 * Description: Upload video files and handle multipart uploads.
 */
router.post(
  '/upload-video',
  upload.single('file'),
  catchAsync(async (req, res) => {
    const { file } = req;
    const { fileName } = req.body;

    // Validate inputs
    if (!file || !fileName) {
      return res.status(400).json({ message: 'File or fileName is missing' });
    }

    const filePath = path.resolve(__dirname, file.path);

    try {
    
      const result = await startOrResumeMultipartUpload(filePath, fileName);

     
      fs.unlinkSync(filePath);

   
      res.status(200).json({ message: result.message, fileUrl: result.fileUrl });
    } catch (error) {
      console.error('Error during upload:', error.message);

  
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(500).json({ message: 'Failed to upload video', error: error.message });
    }
  })
);
  

module.exports = router;