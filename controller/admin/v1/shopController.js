
/**
 * ShopController.js
 * @description : exports action methods for Shop.
 */

const Shop = require('../../../model/shop');
const dbService = require("../../../utils/dbServices");
const ShopSchemaKey = require('../../../utils/validation/shopValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const common = require('../../../utils/comon');


 /**
 * @description : create document of Shop in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Shop. {status, message, data}
 */ 
const addShop = async (req, res) => {
    try {
      let dataToCreate = { ...req.body || {} };
      let validateRequest = validation.validateParamsWithJoi(
        dataToCreate,
        ShopSchemaKey.schemaKeys);
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      if(!dataToCreate.shopName || !dataToCreate.shopOwner){
        return res.badRequest({ message: 'Insufficient request parameters! shopName and shopOwner are required' });
      }
      dataToCreate.addedBy = req.user.id;
      dataToCreate = new Shop(dataToCreate);
      let createdShop = await dbService.create(Shop,dataToCreate);
      return res.success({ data : createdShop });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
  };
 
  /**
 * @description : create multiple documents of Shop in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Shops. {status, message, data}
 */
const bulkInsertShop = async (req,res)=>{
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
    let createdShops = await dbService.create(Shop,dataToCreate);
    createdShops = { count: createdShops ? createdShops.length : 0 };
    return res.success({ data:{ count:createdShops.count || 0 } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : find all documents of Shop from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Shop(s). {status, message, data}
 */
const findAllShop = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      ShopSchemaKey.findFilterKeys,
      Shop.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Shop, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundShops = await dbService.paginate( Shop,query,options);
    if (!foundShops || !foundShops.data || !foundShops.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundShops });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
 

/**
 * @description : find document of Shop from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Shop. {status, message, data}
 */
const getShop = async (req,res) => {
    try {
      let query = {};
      if (!ObjectId.isValid(req.params.id)) {
        return res.validationError({ message : 'invalid objectId.' });
      }
      query._id = req.params.id;
      let options = {};
      let foundShop = await dbService.findOne(Shop,query, options);
      if (!foundShop){
        return res.recordNotFound();
      }
      return res.success({ data :foundShop });
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


  /**
 * @description : returns total number of documents of Shop.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getShopCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      ShopSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedShop = await dbService.count(Shop,where);
    return res.success({ data : { count: countedShop } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Shop with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Shop.
 * @return {Object} : updated Shop. {status, message, data}
 */
const updateShop = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        ShopSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedShop = await dbService.updateOne(Shop,query,dataToUpdate);
      if (!updatedShop){
        return res.recordNotFound();
      }
      return res.success({ data :updatedShop });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update multiple records of Shop with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Shops.
 * @return {Object} : updated Shops. {status, message, data}
 */
const bulkUpdateShop = async (req,res)=>{
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
    let updatedShop = await dbService.updateMany(Shop,filter,dataToUpdate);
    if (!updatedShop){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedShop } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

 /**
 * @description : deactivate document of Shop from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Shop.
 * @return {Object} : deactivated Shop. {status, message, data}
 */
const softDeleteShop = async (req,res) => {
    try {
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      let query = { _id:req.params.id };
      const updateBody = {
        isDeleted: true,
        updatedBy: req.user.id,
      };
      let updatedShop = await dbService.updateOne(Shop, query, updateBody);
      if (!updatedShop){
        return res.recordNotFound();
      }
      return res.success({ data:updatedShop });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };
      
/**
 * @description : delete document of Shop from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Shop. {status, message, data}
 */
const deleteShop = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedShop = await dbService.deleteOne(Shop, query);
    if (!deletedShop){
      return res.recordNotFound();
    }
    return res.success({ data :deletedShop });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : delete documents of Shop in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyShop = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedShop = await dbService.deleteMany(Shop,query);
    if (!deletedShop){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedShop } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
/**
 * @description : deactivate multiple documents of Shop from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Shop.
 * @return {Object} : number of deactivated documents of Shop. {status, message, data}
 */
const softDeleteManyShop = async (req,res) => {
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
    let updatedShop = await dbService.updateMany(Shop,query, updateBody);
    if (!updatedShop) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedShop } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};



 
module.exports = {
  addShop,
  bulkInsertShop,
  findAllShop,
  getShop,
  getShopCount,
  updateShop,
  bulkUpdateShop,
  softDeleteShop,
  deleteShop,
  deleteManyShop,
  softDeleteManyShop    
};