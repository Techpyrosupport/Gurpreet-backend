/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/userapp/auth', require("./auth"));
router.use('/userapp/user',require('./userRoutes'));
router.use('/userapp/blog',require('./blogRoutes'));
router.use('/userapp/shop',require('./shop'));
router.use('/userapp/category',require('./category'));
router.use('/userapp/ip',require('./ip'));



module.exports = router;