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
router.use('/userapp/aiResponse',require("./aiResponseRoute"))
router.use('/userapp/onboard',require("./onBoardRoute"))
router.use('/userapp/contact' ,require('./contactRoutes'));
router.use('/userapp/code',require("./codeRoutes"));
router.use('/userapp/payment',require('./paymentRoutes'))



module.exports = router;