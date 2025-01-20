/**
 * courseRoutes.js
 * @description :: routes of course
 */

const express = require('express');
const { addCourse, findAllCourses, getCourse, deleteCourse, updateCourse, getCourseCount } = require('../../../controller/admin/v1/courseController');
const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const router = express.Router();


router.post('/create', auth(PLATFORM.ADMIN), addCourse);
router.post("/list",auth(PLATFORM.ADMIN),findAllCourses);
router.get("/get/:id",getCourse);
router.delete("/delete/:id",auth(PLATFORM.ADMIN),deleteCourse);
router.put("/soft-delete/:id",auth(PLATFORM.ADMIN),deleteCourse);
router.delete("/delete-many",auth(PLATFORM.ADMIN),deleteCourse);
router.put("/update/:id",auth(PLATFORM.ADMIN),updateCourse);
router.post("/count",auth(PLATFORM.ADMIN),getCourseCount)










module.exports = router;
