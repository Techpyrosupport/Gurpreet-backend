const express = require("express");
const router = express.Router();
const CategoryController = require("../../../controller/userapp/v1/categoryController");



router.get('/list', CategoryController.findAllCategory);

module.exports = router;


