


const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const Contact = require('../../../model/contact')
const ContactSchemaKey = require('../../../utils/validation/contactValidation')
 




  /**
 * @description : create document of Contact in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Contact. {status, message, data}
 */ 
const addContact = async (req, res) => {
  try {
 
 
   

    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      ContactSchemaKey.schemaKeys
      );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }


    dataToCreate = new Contact(dataToCreate);
    let createdContact = await dbService.create(Contact,dataToCreate);
  
    return res.success({ data : createdContact });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of Contact from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Contact. {status, message, data}
 */
const getContact = async (req,res) => {
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
    let foundContact = await dbService.findOne(Contact,query, options);
    if (!foundContact){
      return res.recordNotFound();
    }
    return res.success({ data :foundContact });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Contact with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Contact.
 * @return {Object} : updated Contact. {status, message, data}
 */
const updateContact = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
       


      let dataToUpdate = { ...req.body, };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        ContactSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
       
        const query = { _id: req.params.id };
      let updatedContact = await dbService.updateOne(Contact, query, dataToUpdate);
      if (!updatedContact) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedContact });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of Contact from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Contact.
 * @return {Object} : deactivated Contact. {status, message, data}
 */
const softDeleteContact= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedContact = await dbService.updateOne(Contact, query, updateBody);
      if (!updatedContact) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedContact });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of Contact from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Contact. {status, message, data}
 */
const deleteContact = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedContact = await dbService.deleteOne(Contact, query);
    if (!deletedContact){
      return res.recordNotFound();
    }
    return res.success({ data :deletedContact });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of Contact from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Contact(s). {status, message, data}
 */
const findAllContacts = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      ContactSchemaKey.findFilterKeys,
      Contact.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
  query.isDeleted =false;
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
   
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Contact, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundContacts = await dbService.paginate( Contact,query,options);
    if (!foundContacts || !foundContacts.data || !foundContacts.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundContacts });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
/**
 * @description : returns total number of documents of Contact.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getContactCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      ContactSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedContact = await dbService.count(Contact,where);
    return res.success({ data : { count: countedContact } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

 /**
 * @description : delete documents of Contact in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
 const deleteManyContact = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedContact = await dbService.deleteMany(Contact,query);
    if (!deletedContact){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedContact } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

  module.exports = {
    getContact,
    addContact,
    updateContact,
    deleteContact,
    softDeleteContact,
    findAllContacts,
    getContactCount,
    deleteManyContact

}