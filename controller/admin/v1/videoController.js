
const Video = require("../../../model/video");
const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const VideoSchemaKey = require('../../../utils/validation/videoValidation');
const AWS = require('aws-sdk');

const { S3Config } = require("../../../config/awsConfig");




  /**
 * @description : create document of Video in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Video. {status, message, data}
 */ 
const addVideo = async (req, res) => {
  try {
 
    let createdBy = req.user.id;
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

if(!req.body.videoUrl){
    return res.badRequest({ message: 'videoUrl is required' });
}


let dataToCreate = { ...req.body,createdBy:createdBy.toString() || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
    VideoSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }

  
    dataToCreate = new Video(dataToCreate);
    let createdVideo = await dbService.create(Video,dataToCreate);
  
    return res.success({ data : createdVideo });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of Video from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Video. {status, message, data}
 */
const getVideo = async (req,res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message : 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundVideo = await dbService.findOne(Video,query, options);
    if (!foundVideo){
      return res.recordNotFound();
    }
    return res.success({ data :foundVideo });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Video with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Video.
 * @return {Object} : updated Video. {status, message, data}
 */
const updateVideo = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
      let dataToUpdate = { ...req.body, };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        VideoSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
       
  
      const query = { _id: req.params.id };
      let updatedVideo = await dbService.updateOne(Video, query, dataToUpdate);
      if (!updatedVideo) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedVideo });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of Video from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Video.
 * @return {Object} : deactivated Video. {status, message, data}
 */
const softDeleteVideo= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedVideo = await dbService.updateOne(Video, query, updateBody);
      if (!updatedVideo) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedVideo });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };



/**
 * @description : Delete a video from MongoDB and AWS S3 storage.
 * @param {Object} req : Request containing the video ID.
 * @param {Object} res : Response after deletion.
 * @return {Object} : Deleted video details. {status, message, data}
 */


const deleteVideo = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }

        const query = { _id: req.params.id };
        const video = await dbService.findOne(Video, query);
        if (!video) {
            return res.recordNotFound();
        }

        // Custom URL parser for DigitalOcean Spaces
        const parseSpacesUrl = (url) => {
            const pattern = /^https:\/\/([\w-]+)\.([\w-]+)\.cdn\.digitaloceanspaces\.com\/(.+)$/;
            const match = url.match(pattern);

            if (!match) {
                throw new Error('Invalid DigitalOcean Spaces URL');
            }

            return {
                bucket: match[1],
                key: match[3],
            };
        };

        const { bucket, key } = parseSpacesUrl(video.videoUrl);

     
        const spacesEndpoint = new AWS.Endpoint('sgp1.digitaloceanspaces.com');
        const s3 = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId: S3Config.DO_S3_ACCESS_KEY_ID,
            secretAccessKey: S3Config.DO_S3_SECRET_ACCESS_KEY,
        });

  
        const deleteParams = {
            Bucket: bucket,
            Key: key,
        };

        await s3.deleteObject(deleteParams).promise();
        const deletedVideo = await dbService.deleteOne(Video, query);

        if (!deletedVideo) {
            return res.recordNotFound();
        }

        return res.success({ message: 'Video deleted successfully.', data: deletedVideo });
    } catch (error) {
        return res.internalServerError({ message: `Error: ${error.message}` });
    }
};


      
/**
 * @description : find all documents of Video from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Video(s). {status, message, data}
 */
const findAllVideos = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      VideoSchemaKey.findFilterKeys,
      Video.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    query._id = { $ne: req.user.id };
    query.isDeleted = false;
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
   
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Video, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundVideos = await dbService.paginate( Video,query,options);
    if (!foundVideos || !foundVideos.data || !foundVideos.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundVideos });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
/**
 * @description : returns total number of documents of Video.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getVideoCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      VideoSchemaKey.findFilterKeys,
    );
    where.isDeleted = false;
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedVideo = await dbService.count(Video,where);
    return res.success({ data : { count: countedVideo } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  module.exports = {
    getVideo,
    addVideo,
    updateVideo,
    deleteVideo,
    softDeleteVideo,
    findAllVideos,
    getVideoCount

}