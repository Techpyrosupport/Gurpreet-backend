/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/admin/auth', require("./auth"));
router.use('/admin/user',require('./userRoutes'));
router.use('/admin/file',require('./uploadRoutes'));
router.use("/admin/course", require("./courseRoutes"));
router.use("/admin/quiz",require("./quizRoutes"));
router.use("/admin/video",require("./videoRoutes"));
router.use("/admin/topic",require("./topicRoutes"));
router.use("/admin/onboard",require("./onBoardRoutes"));
router.use("/admin/contact",require("./contactRoutes"));


module.exports = router;