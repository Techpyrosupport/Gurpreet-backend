/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/userapp/auth', require("./auth"));
router.use('/userapp/user',require('./userRoutes'));
router.use('/userapp/course',require("./courseRoutes"))
router.use('/userapp/quiz',require("./quizRouter"))




module.exports = router;