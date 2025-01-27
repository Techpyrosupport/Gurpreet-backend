/**
 * courseRoutes.js
 * @description :: routes of course
 */

const express = require('express');

const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { evaluateQuiz, getQuizResponse } = require('../../../controller/userapp/v1/quizController');
const autherize = require('../../../middleware/authorize');
const router = express.Router();




router.post("/evalute-quiz",auth(PLATFORM.USERAPP),evaluateQuiz);
router.get("/get/:id",auth(PLATFORM.USERAPP),getQuizResponse) ;







module.exports = router;
