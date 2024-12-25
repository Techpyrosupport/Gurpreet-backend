
/**
 * IpController.js
 * @description : exports action methods for Ip.
 */

const Ip = require('../../../model/ip');
const dbService = require("../../../utils/dbServices");


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

      dataToCreate = new Ip(dataToCreate);
      let createdIp = await dbService.create(Ip,dataToCreate);
      return res.success({ data : createdIp });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
  };

  const updateIp = async (req,res) => {
    try {
      let dataToUpdate = {
        ...req.body,
      };
      if(dataToUpdate.ipAddress){
        res.badRequest({ message: "you haven't permission to update Ip address"});
      }
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

module.exports = {
  addIp, 
  updateIp  
};