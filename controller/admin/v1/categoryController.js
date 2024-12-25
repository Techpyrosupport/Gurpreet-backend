
/**
 * ShopController.js
 * @description : exports action methods for Shop.
 */

const Category = require('../../../model/category');

/**
 * @description : find all documents of Shop from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Shop(s). {status, message, data}
 */
const findAllCategory = async (req,res) => {
  try {
    
    let data = await Category.findOne({})
    return res.success({ data :data });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};



 
module.exports = {
    findAllCategory,    
};