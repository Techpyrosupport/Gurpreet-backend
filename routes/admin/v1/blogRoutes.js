const express = require("express");
const router = express.Router();
const blogController = require("../../../controller/admin/v1/blogController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),blogController.addBlog);
router.post('/addBulk',auth(PLATFORM.ADMIN),blogController.bulkInsertBlog);
router.get('/get/:id',auth(PLATFORM.ADMIN), blogController.getBlog);
router.post('/list',auth(PLATFORM.ADMIN), blogController.findAllBlog);
router.post('/count',auth(PLATFORM.ADMIN),blogController.getBlogCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), blogController.updateBlog);
router.put('/updateBulk',auth(PLATFORM.ADMIN),blogController.bulkUpdateBlog);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), blogController.softDeleteBlog);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),blogController.deleteBlog);
router.post('/deleteMany',auth(PLATFORM.ADMIN),blogController.deleteManyBlog);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),blogController.softDeleteManyBlog);


module.exports = router;


