


const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');
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
 



  module.exports = {
    addContact,

}