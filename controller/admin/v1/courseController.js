


const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const Course = require('../../../model/courses');
const courseSchemaKey = require('../../../utils/validation/courseValidation');
 




  /**
 * @description : create document of Course in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Course. {status, message, data}
 */ 
const addCourse = async (req, res) => {
  try {
 
    let createdBy = req.user.id;
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

    let dataToCreate = { ...req.body,createdBy:createdBy.toString() || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      courseSchemaKey.schemaKeys
      );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }


    dataToCreate = new Course(dataToCreate);
    let createdCourse = await dbService.create(Course,dataToCreate);
  
    return res.success({ data : createdCourse });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of Course from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Course. {status, message, data}
 */
const getCourse = async (req,res) => {
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
    let foundCourse = await dbService.findOne(Course,query, options);
    if (!foundCourse){
      return res.recordNotFound();
    }
    return res.success({ data :foundCourse });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Course with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Course.
 * @return {Object} : updated Course. {status, message, data}
 */
const updateCourse = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
       


      let dataToUpdate = { ...req.body };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        courseSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
       
  
      const query = { _id: req.params.id };
      let updatedCourse = await dbService.updateOne(Course, query, dataToUpdate);
      if (!updatedCourse) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedCourse });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of Course from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Course.
 * @return {Object} : deactivated Course. {status, message, data}
 */
const softDeleteCourse= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedCourse = await dbService.updateOne(Course, query, updateBody);
      if (!updatedCourse) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedCourse });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of Course from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Course. {status, message, data}
 */
const deleteCourse = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedCourse = await dbService.deleteOne(Course, query);
    if (!deletedCourse){
      return res.recordNotFound();
    }
    return res.success({ data :deletedCourse });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of Course from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Course(s). {status, message, data}
 */
const findAllCourses = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      courseSchemaKey.findFilterKeys,
      Course.schema.obj
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
      let totalRecords = await dbService.count(Course, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundCourses = await dbService.paginate( Course,query,options);
    if (!foundCourses || !foundCourses.data || !foundCourses.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundCourses });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
/**
 * @description : returns total number of documents of Course.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getCourseCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      courseSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedCourse = await dbService.count(Course,where);
    return res.success({ data : { count: countedCourse } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

 /**
 * @description : delete documents of Course in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
 const deleteManyCourse = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedCourse = await dbService.deleteMany(Course,query);
    if (!deletedCourse){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedCourse } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

  module.exports = {
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    softDeleteCourse,
    findAllCourses,
    getCourseCount,
    deleteManyCourse

}