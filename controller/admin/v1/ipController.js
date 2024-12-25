
/**
 * IpController.js
 * @description : exports action methods for Ip.
 */

const Ip = require('../../../model/ip');
const dbService = require("../../../utils/dbServices");
const ObjectId = require('mongodb').ObjectId;


 /**
 * @description : create document of Ip in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Ip. {status, message, data}
 */ 
const addIp = async (req, res) => {
    try {
      let dataToCreate = { ...req.body || {} };
      let ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
      
      if(!dataToCreate.ipAddress){
        return res.badRequest({ message: 'Insufficient request parameters! ipAddress  is required.' });
      }

      if(!ipRegex.test(dataToCreate.ipAddress)){
        return res.validationError({ message : `Invalid Ip Address, ${dataToCreate.ipAddress}` });
      }

      let found = await Ip.findOne({ipAddress: dataToCreate.ipAddress});
        if(found){
          return res.validationError({message : `${dataToCreate.ipAddress} already exists.Unique Ip Address are allowed.`})
        }

      dataToCreate = new Ip(dataToCreate);
      let createdIp = await dbService.create(Ip,dataToCreate);
      return res.success({ data : createdIp });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
  };

  const findAllIp = async (req,res) => {
    try {
      let options = {};
      let query = {};
      if (typeof req.body.query === 'object' && req.body.query !== null) {
        query = { ...req.body.query };
      }
      if (req.body.isCountOnly){
        let totalRecords = await dbService.count(Ip, query);
        return res.success({ data: { totalRecords } });
      }
      if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
        options = { ...req.body.options };
      }
      let foundIps = await dbService.paginate( Ip,query,options);
      if (!foundIps || !foundIps.data || !foundIps.data.length){
        return res.recordNotFound(); 
      }
      return res.success({ data :foundIps });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  const getIp = async (req,res) => {
    try {
      let query = {};
      if (!ObjectId.isValid(req.params.id)) {
        return res.validationError({ message : 'invalid objectId.' });
      }
      query._id = req.params.id;
      let options = {};
      let foundIp = await dbService.findOne(Ip,query, options);
      if (!foundIp){
        return res.recordNotFound();
      }
      return res.success({ data :foundIp });
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


  /**
 * @description : returns total number of documents of Ip.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getIpCount = async (req,res) => {
  try {
    let where = {};
    
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedIp = await dbService.count(Ip,where);
    return res.success({ data : { count: countedIp } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Ip with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Ip.
 * @return {Object} : updated Ip. {status, message, data}
 */
const updateIp = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      
      const query = { _id:req.params.id };
      let updatedIp = await dbService.updateOne(Ip,query,dataToUpdate);
      if (!updatedIp){
        return res.recordNotFound();
      }
      return res.success({ data :updatedIp });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  /**
 * @description : update multiple records of Ip with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Ips.
 * @return {Object} : updated Ips. {status, message, data}
 */
const bulkUpdateIp = async (req,res)=>{
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
    let updatedIp = await dbService.updateMany(Ip,filter,dataToUpdate);
    if (!updatedIp){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedIp } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

 /**
 * @description : deactivate document of Ip from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Ip.
 * @return {Object} : deactivated Ip. {status, message, data}
 */
const softDeleteIp = async (req,res) => {
    try {
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      let query = { _id:req.params.id };
      const updateBody = {
        isDeleted: true,
        updatedBy: req.user.id,
      };
      let updatedIp = await dbService.updateOne(Ip, query, updateBody);
      if (!updatedIp){
        return res.recordNotFound();
      }
      return res.success({ data:updatedIp });
    } catch (error){
      return res.internalServerError({ message:error.message }); 
    }
  };
      
/**
 * @description : delete document of Ip from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Ip. {status, message, data}
 */
const deleteIp = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedIp = await dbService.deleteOne(Ip, query);
    if (!deletedIp){
      return res.recordNotFound();
    }
    return res.success({ data :deletedIp });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : delete documents of Ip in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyIp = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedIp = await dbService.deleteMany(Ip,query);
    if (!deletedIp){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedIp } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
/**
 * @description : deactivate multiple documents of Ip from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Ip.
 * @return {Object} : number of deactivated documents of Ip. {status, message, data}
 */
const softDeleteManyIp = async (req,res) => {
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
    let updatedIp = await dbService.updateMany(Ip,query, updateBody);
    if (!updatedIp) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedIp } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

 
module.exports = {
  addIp,   
  findAllIp,
  getIp,
  getIpCount,
  updateIp,
  bulkUpdateIp,
  softDeleteIp,
  deleteIp,
  deleteManyIp,
  softDeleteManyIp
};