
/**
 * CodeController.js
 * @description : exports action methods for Code.
 */

const Code = require('../../../model/code');
const dbService = require("../../../utils/dbServices");
const  CodeSchemaKey = require('../../../utils/validation/codeValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const common = require('../../../utils/comon');


 /**
 * @description : create document of Code in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Code. {status, message, data}
 */ 
 const addCode = async (req, res) => {
    try {
        console.log(req.body)
      let dataToCreate = { ...req.body || {} };
  
      // Validate the request body
      const validateRequest = validation.validateParamsWithJoi(dataToCreate, CodeSchemaKey.schemaKeys);
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
  
      // Convert `inputs` to a Map if it's an object
      if (dataToCreate.inputs && typeof dataToCreate.inputs === 'object') {
        dataToCreate.inputs = new Map(Object.entries(dataToCreate.inputs));
      }
  
      // Add user information
      dataToCreate.addedBy = req.user.id;
  
      // Create and save the document
      let createdCode = new Code(dataToCreate);
      createdCode = await createdCode.save();
  
      return res.success({ data: createdCode });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };
  
 
  /**
 * @description : create multiple documents of Code in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Codes. {status, message, data}
 */
const bulkInsertCode = async (req,res)=>{
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
    let createdCodes = await dbService.create(Code,dataToCreate);
    createdCodes = { count: createdCodes ? createdCodes.length : 0 };
    return res.success({ data:{ count:createdCodes.count || 0 } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : find all documents of Code from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Code(s). {status, message, data}
 */
const findAllCode = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
       CodeSchemaKey.findFilterKeys,
      Code.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Code, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundCodes = await dbService.paginate( Code,query,options);
    if (!foundCodes || !foundCodes.data || !foundCodes.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundCodes });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
 

/**
 * @description : find document of Code from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Code. {status, message, data}
 */
const getCode = async (req,res) => {
    try {
      let query = {};
      if (!ObjectId.isValid(req.params.id)) {
        return res.validationError({ message : 'invalid objectId.' });
      }
      query._id = req.params.id;
      let options = {};
      let foundCode = await dbService.findOne(Code,query, options);
      if (!foundCode){
        return res.recordNotFound();
      }
      return res.success({ data :foundCode });
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


  /**
 * @description : returns total number of documents of Code.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getCodeCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
       CodeSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedCode = await dbService.count(Code,where);
    return res.success({ data : { count: countedCode } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Code with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Code.
 * @return {Object} : updated Code. {status, message, data}
 */
const updateCode = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
         CodeSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedCode = await dbService.updateOne(Code,query,dataToUpdate);
      if (!updatedCode){
        return res.recordNotFound();
      }
      return res.success({ data :updatedCode });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update multiple records of Code with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Codes.
 * @return {Object} : updated Codes. {status, message, data}
 */
const bulkUpdateCode = async (req,res)=>{
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
    let updatedCode = await dbService.updateMany(Code,filter,dataToUpdate);
    if (!updatedCode){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedCode } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

 /**
 * @description : deactivate document of Code from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Code.
 * @return {Object} : deactivated Code. {status, message, data}
 */
const softDeleteCode = async (req,res) => {
    try {
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      let query = { _id:req.params.id };
      const updateBody = {
        isDeleted: true,
        updatedBy: req.user.id,
      };
      let updatedCode = await dbService.updateOne(Code, query, updateBody);
      if (!updatedCode){
        return res.recordNotFound();
      }
      return res.success({ data:updatedCode });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };
      
/**
 * @description : delete document of Code from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Code. {status, message, data}
 */
const deleteCode = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedCode = await dbService.deleteOne(Code, query);
    if (!deletedCode){
      return res.recordNotFound();
    }
    return res.success({ data :deletedCode });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : delete documents of Code in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyCode = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedCode = await dbService.deleteMany(Code,query);
    if (!deletedCode){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedCode } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
/**
 * @description : deactivate multiple documents of Code from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Code.
 * @return {Object} : number of deactivated documents of Code. {status, message, data}
 */
const softDeleteManyCode = async (req,res) => {
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
    let updatedCode = await dbService.updateMany(Code,query, updateBody);
    if (!updatedCode) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedCode } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};



 
module.exports = {
  addCode,
  bulkInsertCode,
  findAllCode,
  getCode,
  getCodeCount,
  updateCode,
  bulkUpdateCode,
  softDeleteCode,
  deleteCode,
  deleteManyCode,
  softDeleteManyCode    
};