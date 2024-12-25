/**
 * BlogController.js
 * @description : exports action methods for Blog.
 */

const Blog = require("../../../model/blog");
const dbService = require("../../../utils/dbServices");
const blogSchemaKey = require("../../../utils/validation/blogValidation");
const validation = require("../../../utils/validateRequest");
const ObjectId = require("mongodb").ObjectId;
const common = require("../../../utils/comon");

/**
 * @description : create document of Blog in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Blog. {status, message, data}
 */
const addBlog = async (req, res) => {
  try {
    let dataToCreate = { ...(req.body || {}) };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      blogSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    dataToCreate.author = req.user.id;
    dataToCreate = new Blog(dataToCreate);
    let createdBlog = await dbService.create(Blog, dataToCreate);
    return res.success({ data: createdBlog });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Blog in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Blogs. {status, message, data}
 */
const bulkInsertBlog = async (req, res) => {
  try {
    if (
      req.body &&
      (!Array.isArray(req.body.data) || req.body.data.length < 1)
    ) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i] = {
        ...dataToCreate[i],
        author: req.user.id,
      };
    }
    let createdBlogs = await dbService.create(Blog, dataToCreate);
    createdBlogs = { count: createdBlogs ? createdBlogs.length : 0 };
    return res.success({ data: { count: createdBlogs.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Blog from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Blog(s). {status, message, data}
 */
const findAllBlog = async (req, res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      blogSchemaKey.findFilterKeys,
      Blog.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === "object" && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Blog, query);
      return res.success({ data: { totalRecords } });
    }
    if (
      req.body &&
      typeof req.body.options === "object" &&
      req.body.options !== null
    ) {
      options = { ...req.body.options };
    }
    let foundBlogs = await dbService.paginate(Blog, query, options);
    if (!foundBlogs || !foundBlogs.data || !foundBlogs.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundBlogs });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Blog from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Blog. {status, message, data}
 */
const getBlog = async (req, res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: "invalid objectId." });
    }
    query._id = req.params.id;
    let options = {};
    let foundBlog = await Blog.findOne(query).populate("author");
    if (!foundBlog) {
      return res.recordNotFound();
    }
    return res.success({ data: foundBlog });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Blog.
 * @param {Object} req : request including where object to apply filters in req body
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getBlogCount = async (req, res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      blogSchemaKey.findFilterKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === "object" && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedBlog = await dbService.count(Blog, where);
    return res.success({ data: { count: countedBlog } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Blog with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Blog.
 * @return {Object} : updated Blog. {status, message, data}
 */

const updateBlog = async (req, res) => {
  try {
    let dataToUpdate = {
      ...req.body,
      updatedBy: req.user.id,
    };
    console.log("dataToUpdate", dataToUpdate);
    let {
      title,
      subTitle,
      category,
      image,
      readTime,
      metatitle,
      metadescription,
      author,
      like,
      likeCount,
    } = req.body;
    if (
      title ||
      subTitle ||
      category ||
      image ||
      readTime ||
      metatitle ||
      metadescription ||
      author ||
      like ||
      likeCount
    )
      return res.unAuthorized({ message: "You have not permision" });

    console.log("object2");

    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      blogSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    console.log("validate");
    const query = { _id: req.params.id };
    let updatedBlog = await dbService.updateOne(Blog, query, dataToUpdate);
    if (!updatedBlog) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedBlog });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateBlogLike = async (req, res) => {
  try {
    let dataToUpdate = {};
    // let validateRequest = validation.validateParamsWithJoi(
    //     dataToUpdate,
    //     BlogSchemaKey.updateSchemaKeys
    //   );
    //   if (!validateRequest.isValid) {
    //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    //   }
    const query = { _id: req.params.id };

    let findBlog = await Blog.findOne(query);
    if (!findBlog) {
      return res.recordNotFound();
    }
    if (findBlog.like.includes(req.user.id)) {
      let index = findBlog.like.indexOf(req.user.id);
      let like = [...findBlog.like];
      let likeCount = findBlog.likeCount - 1;
      like.splice(index, 1);
      dataToUpdate = { like: like, likeCount };
    } else {
      let like = [...findBlog.like];
      let likeCount = findBlog.likeCount + 1;
      like.push(req.user.id);
      dataToUpdate = { like: like, likeCount };
    }
    let updatedBlog = await Blog.findOneAndUpdate(query, dataToUpdate, {
      new: true,
    });
    if (!updatedBlog) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedBlog });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  findAllBlog,
  getBlog,
  getBlogCount,
  updateBlog,
  updateBlogLike,
};
