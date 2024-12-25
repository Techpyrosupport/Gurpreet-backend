const express = require("express");
const router = express.Router();
const blogController = require("../../../controller/userapp/v1/blogController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.get('/get/:id', blogController.getBlog);
router.post('/list', blogController.findAllBlog);
router.post('/count',blogController.getBlogCount);
router.put('/update/:id',auth(PLATFORM.USERAPP), blogController.updateBlog);
router.put('/update-like/:id',auth(PLATFORM.USERAPP), blogController.updateBlogLike);


module.exports = router;


