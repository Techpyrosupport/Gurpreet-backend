



const quiz = require("../../../model/quiz");
const user = require("../../../model/user");
const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const quizValidation = require("../../../utils/validation/quizValidation")

 




  /**
 * @description : create document of quiz in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created quiz. {status, message, data}
 */ 
const addquiz = async (req, res) => {
  try {
 

    let createdBy = req.user.id;
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

    let dataToCreate = { ...req.body,createdBy:createdBy.toString() || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
     quizValidation.schemaKeys
      );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }


    dataToCreate = new quiz(dataToCreate);
    let createdQuiz = await dbService.create(quiz,dataToCreate);
  
    return res.success({ data :createdQuiz });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of quiz from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found quiz. {status, message, data}
 */
const getQuiz = async (req,res) => {
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
    let foundquiz = await dbService.findOne(quiz,query, options);
    if (!foundquiz){
      return res.recordNotFound();
    }
    return res.success({ data :foundquiz });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of quiz with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated quiz.
 * @return {Object} : updated quiz. {status, message, data}
 */
const updatequiz = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
       


      let dataToUpdate = { ...req.body, };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
      quizValidation.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
       
  
      const query = { _id: req.params.id };
      let updatedquiz = await dbService.updateOne(quiz, query, dataToUpdate);
      if (!updatedquiz) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedquiz });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of quiz from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of quiz.
 * @return {Object} : deactivated quiz. {status, message, data}
 */
const softDeletequiz= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedquiz = await dbService.updateOne(quiz, query, updateBody);
      if (!updatedquiz) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedquiz });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of quiz from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted quiz. {status, message, data}
 */
const deletequiz = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedquiz = await dbService.deleteOne(quiz, query);
    if (!deletedquiz){
      return res.recordNotFound();
    }
    return res.success({ data :deletedquiz });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of quiz from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found quiz(s). {status, message, data}
 */
const findAllquizs = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
    quizValidation.findFilterKeys,
      quiz.schema.obj
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
      let totalRecords = await dbService.count(quiz, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundquizs = await dbService.paginate( quiz,query,options);
    if (!foundquizs || !foundquizs.data || !foundquizs.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundquizs });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
/**
 * @description : returns total number of documents of quiz.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getquizCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      quizValidation.findFilterKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedquiz = await dbService.count(quiz,where);
    return res.success({ data : { count: countedquiz } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};


  module.exports = {
    getQuiz,
    addquiz,
    updatequiz,
    deletequiz,
    softDeletequiz,
    findAllquizs,
    getquizCount

}