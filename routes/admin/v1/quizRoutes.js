/**
 * courseRoutes.js
 * @description :: routes of course
 */

const express = require('express');

const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { addquiz, findAllquizs, deletequiz, getQuiz, updatequiz, getquizCount } = require('../../../controller/admin/v1/quizController');
const router = express.Router();


router.post('/create', auth(PLATFORM.ADMIN),addquiz);
router.post("/list",auth(PLATFORM.ADMIN),findAllquizs);
router.get("/get/:id",getQuiz);
router.delete("/delete/:id",auth(PLATFORM.ADMIN),deletequiz);
router.put("/soft-delete/:id",auth(PLATFORM.ADMIN),deletequiz);
router.put("/update/:id",auth(PLATFORM.ADMIN),updatequiz);
router.post("/count",auth(PLATFORM.ADMIN),getquizCount)










module.exports = router;
