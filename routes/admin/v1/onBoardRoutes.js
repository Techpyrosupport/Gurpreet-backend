const express = require("express");
const router = express.Router();
const onBoardController = require("../../../controller/admin/v1/onBoardController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),onBoardController.addOnBoard);
router.post('/addBulk',auth(PLATFORM.ADMIN),onBoardController.bulkInsertOnBoard);
router.get('/get/:id',auth(PLATFORM.ADMIN), onBoardController.getOnBoard);
router.post('/list',auth(PLATFORM.ADMIN), onBoardController.findAllOnBoard);
router.post('/count',auth(PLATFORM.ADMIN),onBoardController.getOnBoardCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), onBoardController.updateOnBoard);
router.put('/updateBulk',auth(PLATFORM.ADMIN),onBoardController.bulkUpdateOnBoard);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), onBoardController.softDeleteOnBoard);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),onBoardController.deleteOnBoard);
router.post('/deleteMany',auth(PLATFORM.ADMIN),onBoardController.deleteManyOnBoard);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),onBoardController.softDeleteManyOnBoard);


module.exports = router;


