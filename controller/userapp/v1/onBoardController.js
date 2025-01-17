
/**
 * OnBoardController.js
 * @description : exports action methods for OnBoard.
 */


const dbService = require("../../../utils/dbServices");
const OnBoardSchemaKey = require('../../../utils/validation/onBoardValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const common = require('../../../utils/comon');
const axios = require("axios");
const OnBoard = require("../../../model/onboard");

 /**
 * @description : create document of OnBoard in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created OnBoard. {status, message, data}
 */ 
const addOnBoard = async (req, res) => {
    try {
      let dataToCreate = { ...req.body || {} };
      let validateRequest = validation.validateParamsWithJoi(
        dataToCreate,
        OnBoardSchemaKey.schemaKeys);
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      dataToCreate.addedBy = req.user.id;
      dataToCreate = new OnBoard(dataToCreate);
      let createdOnBoard = await dbService.create(OnBoard,dataToCreate);


      return res.success({ data : createdOnBoard });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
  };
 
  /**
 * @description : create multiple documents of OnBoard in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created OnBoards. {status, message, data}
 */
const bulkInsertOnBoard = async (req,res)=>{
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [ ...req.body.data ];
    for (let i = 0;i < dataToCreate.length;i++){
      dataToCreate[i] = {
        ...dataToCreate[i],
        addedBy: req.user.id
      };
    }
    let createdOnBoards = await dbService.create(OnBoard,dataToCreate);
    createdOnBoards = { count: createdOnBoards ? createdOnBoards.length : 0 };
    return res.success({ data:{ count:createdOnBoards.count || 0 } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : find all documents of OnBoard from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found OnBoard(s). {status, message, data}
 */
const findAllOnBoard = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      OnBoardSchemaKey.findFilterKeys,
      OnBoard.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(OnBoard, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    query.userId = req.user.id;
    let foundOnBoards = await dbService.paginate(OnBoard,query,options);
    
    if (!foundOnBoards || !foundOnBoards.data || !foundOnBoards.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundOnBoards });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
 

/**
 * @description : find document of OnBoard from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found OnBoard. {status, message, data}
 */
const getOnBoard = async (req,res) => {
    try {
      let query = {};
      if (!ObjectId.isValid(req.params.id)) {
        return res.validationError({ message : 'invalid objectId.' });
      }
      query._id = req.params.id;
      let options = {};
      let foundOnBoard = await dbService.findOne(OnBoard,query, options);
      if (!foundOnBoard){
        return res.recordNotFound();
      }
      return res.success({ data :foundOnBoard });
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


  /**
 * @description : returns total number of documents of OnBoard.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getOnBoardCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      OnBoardSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedOnBoard = await dbService.count(OnBoard,where);
    return res.success({ data : { count: countedOnBoard } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of OnBoard with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated OnBoard.
 * @return {Object} : updated OnBoard. {status, message, data}
 */
const updateOnBoard = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        OnBoardSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedOnBoard = await dbService.updateOne(OnBoard,query,dataToUpdate);
      if (!updatedOnBoard){
        return res.recordNotFound();
      }
      return res.success({ data :updatedOnBoard });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update multiple records of OnBoard with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated OnBoards.
 * @return {Object} : updated OnBoards. {status, message, data}
 */
const bulkUpdateOnBoard = async (req,res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    delete dataToUpdate['addedBy'];
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { 
        ...req.body.data,
        updatedBy : req.user.id
      };
    }
    let updatedOnBoard = await dbService.updateMany(OnBoard,filter,dataToUpdate);
    if (!updatedOnBoard){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedOnBoard } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

 /**
 * @description : deactivate document of OnBoard from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of OnBoard.
 * @return {Object} : deactivated OnBoard. {status, message, data}
 */
const softDeleteOnBoard = async (req,res) => {
    try {
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      let query = { _id:req.params.id };
      const updateBody = {
        isDeleted: true,
        updatedBy: req.user.id,
      };
      let updatedOnBoard = await dbService.updateOne(OnBoard, query, updateBody);
      if (!updatedOnBoard){
        return res.recordNotFound();
      }
      return res.success({ data:updatedOnBoard });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };
      
/**
 * @description : delete document of OnBoard from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted OnBoard. {status, message, data}
 */
const deleteOnBoard = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedOnBoard = await dbService.deleteOne(OnBoard, query);
    if (!deletedOnBoard){
      return res.recordNotFound();
    }
    return res.success({ data :deletedOnBoard });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : delete documents of OnBoard in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyOnBoard = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedOnBoard = await dbService.deleteMany(OnBoard,query);
    if (!deletedOnBoard){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedOnBoard } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
/**
 * @description : deactivate multiple documents of OnBoard from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of OnBoard.
 * @return {Object} : number of deactivated documents of OnBoard. {status, message, data}
 */
const softDeleteManyOnBoard = async (req,res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedOnBoard = await dbService.updateMany(OnBoard,query, updateBody);
    if (!updatedOnBoard) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedOnBoard } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};



 
module.exports = {
  addOnBoard,
  bulkInsertOnBoard,
  findAllOnBoard,
  getOnBoard,
  getOnBoardCount,
  updateOnBoard,
  bulkUpdateOnBoard,
  softDeleteOnBoard,
  deleteOnBoard,
  deleteManyOnBoard,
  softDeleteManyOnBoard    
};