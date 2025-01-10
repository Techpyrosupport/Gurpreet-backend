/**
 * courseRoutes.js
 * @description :: routes of course
 */

const express = require('express');

const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { evaluateQuiz } = require('../../../controller/userapp/v1/quizController');
const autherize = require('../../../middleware/authorize');
const router = express.Router();




router.post("/evalute-quiz",auth(PLATFORM.USERAPP),evaluateQuiz) 







module.exports = router;
