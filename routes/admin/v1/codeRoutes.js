const express = require("express");
const router = express.Router();
const CodeController = require("../../../controller/admin/v1/codeController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),CodeController.addCode);
router.post('/addBulk',auth(PLATFORM.ADMIN),CodeController.bulkInsertCode);
router.get('/get/:id',auth(PLATFORM.ADMIN), CodeController.getCode);
router.post('/list',auth(PLATFORM.ADMIN), CodeController.findAllCode);
router.post('/count',auth(PLATFORM.ADMIN),CodeController.getCodeCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), CodeController.updateCode);
router.put('/updateBulk',auth(PLATFORM.ADMIN),CodeController.bulkUpdateCode);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), CodeController.softDeleteCode);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),CodeController.deleteCode);
router.post('/deleteMany',auth(PLATFORM.ADMIN),CodeController.deleteManyCode);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),CodeController.softDeleteManyCode);


module.exports = router;


