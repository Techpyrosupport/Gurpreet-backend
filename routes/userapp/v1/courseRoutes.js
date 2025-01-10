/**
 * courseRoutes.js
 * @description :: routes of course
 */

const express = require('express');
const { PLATFORM } = require('../../../constants/authConstant');
const { getLoggedUserCourse } = require('../../../controller/userapp/v1/courseController');
const auth = require('../../../middleware/auth');

const router = express.Router();


router.get("/my-course",auth(PLATFORM.USERAPP),getLoggedUserCourse)










module.exports = router;
