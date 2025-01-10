


const dbService = require("../../../utils/dbServices");
const validation = require('../../../utils/validateRequest');

const Course = require('../../../model/courses');
const courseSchemaKey = require('../../../utils/validation/courseValidation');
const user = require("../../../model/user");
 

 /**
 * @description : getdocument of Course in mongodb collection.
 * @param {Object} req : request including Query for getting user their Purches Course document.
 * @param {Object} res : response of getting document
 * @return {Object} : getting Course(s). {status, message, data}
 */


 const getLoggedUserCourse = async (req, res) => {
    try {
     
      if (!req.user || !req.user.id) {
        return res.badRequest({
          message: "Insufficient request parameters! User ID is required.",
        });
      }
  
      const userQuery = { _id: req.user.id };
  
     
      const foundUser = await dbService.findOne(user, userQuery, {
        populate: {
          path: "courses.course_id",
        },
      });
  
      if (!foundUser) {
        return res.recordNotFound({
          message: "User not found ",
        });
      }
  
   
      const userCourses = foundUser.courses?.map(course => {
        if (course.course_id) {
          return {
            ...course.course_id.toObject(),
            courseId: course.course_id._id,
          };
        }
        return null;
      }).filter(Boolean); 
  
      if (!userCourses || userCourses.length === 0) {
        return res.recordNotFound({
          message: "No courses found ",
        });
      }
  
    
      return res.success({ data: userCourses });
    } catch (error) {
      // Handle any unexpected errors
      return res.internalServerError({
        message: `Something went wrong: ${error.message}`,
      });
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
   


  module.exports = {
  getLoggedUserCourse,
  findAllCourses

}