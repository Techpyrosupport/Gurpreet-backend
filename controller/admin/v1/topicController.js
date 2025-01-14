


const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;

 const TopicSchemaKey = require('../../../utils/validation/topicValidation');




  /**
 * @description : create document of Topic in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Topic. {status, message, data}
 */ 
const addTopic = async (req, res) => {
  try {
 
    let createdBy = req.user.id;
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

    let dataToCreate = { ...req.body,createdBy:createdBy.toString() || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      TopicSchemaKey.schemaKeys
      );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }


    dataToCreate = new Topic(dataToCreate);
    let createdTopic = await dbService.create(Topic,dataToCreate);
  
    return res.success({ data : createdTopic });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of Topic from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Topic. {status, message, data}
 */
const getTopic = async (req,res) => {
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
    let foundTopic = await dbService.findOne(Topic,query, options);
    if (!foundTopic){
      return res.recordNotFound();
    }
    return res.success({ data :foundTopic });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Topic with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Topic.
 * @return {Object} : updated Topic. {status, message, data}
 */
const updateTopic = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
       


      let dataToUpdate = { ...req.body, };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        TopicSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
       
  
      const query = { _id: req.params.id };
      let updatedTopic = await dbService.updateOne(Topic, query, dataToUpdate);
      if (!updatedTopic) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedTopic });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of Topic from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Topic.
 * @return {Object} : deactivated Topic. {status, message, data}
 */
const softDeleteTopic= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedTopic = await dbService.updateOne(Topic, query, updateBody);
      if (!updatedTopic) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedTopic });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of Topic from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Topic. {status, message, data}
 */
const deleteTopic = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedTopic = await dbService.deleteOne(Topic, query);
    if (!deletedTopic){
      return res.recordNotFound();
    }
    return res.success({ data :deletedTopic });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of Topic from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Topic(s). {status, message, data}
 */
const findAllTopics = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      TopicSchemaKey.findFilterKeys,
      Topic.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    query._id = { $ne: req.user.id };
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
   
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Topic, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundTopics = await dbService.paginate( Topic,query,options);
    if (!foundTopics || !foundTopics.data || !foundTopics.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundTopics });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
/**
 * @description : returns total number of documents of Topic.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getTopicCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      TopicSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedTopic = await dbService.count(Topic,where);
    return res.success({ data : { count: countedTopic } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  module.exports = {
    getTopic,
    addTopic,
    updateTopic,
    deleteTopic,
    softDeleteTopic,
    findAllTopics,
    getTopicCount

}