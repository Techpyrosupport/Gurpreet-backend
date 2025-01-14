const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.DO_S3_ACCESS_KEY_ID, 
  secretAccessKey: process.env.DO_S3_SECRET_ACCESS_KEY,
  endpoint:process.env.DO_SPACES_URI,
  region: process.env.DO_S3_REGION, 
  signatureVersion: 'v4', 
  httpOptions: {
    timeout: 600000, 
    connectTimeout: 5000, 
  },
});

 const S3Config = {
      DO_S3_ACCESS_KEY_ID: process.env.DO_S3_ACCESS_KEY_ID,
      DO_S3_SECRET_ACCESS_KEY: process.env.DO_S3_SECRET_ACCESS_KEY,
      DO_S3_REGION: process.env.DO_S3_REGION,
      DO_S3_BUCKET_NAME: process.env.DO_S3_BUCKET_NAME,
    };

module.exports ={
  S3Config,
  s3
};
