const express = require("express");
const router = express.Router();
const onBoardController = require("../../../controller/userapp/v1/onBoardController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.USERAPP),onBoardController.addOnBoard);
router.post('/list',auth(PLATFORM.USERAPP), onBoardController.findAllOnBoard);
router.get('/get/:id',auth(PLATFORM.USERAPP), onBoardController.getOnBoard);
router.put('/update/:id',auth(PLATFORM.USERAPP), onBoardController.updateOnBoard);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), onBoardController.softDeleteOnBoard);


module.exports = router;


