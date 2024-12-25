const express = require("express");
const router = express.Router();
const ShopController = require("../../../controller/userapp/v1/shopController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");



// router.post('/create',auth(PLATFORM.USERAPP),ShopController.addShop);
router.get('/get/:id', ShopController.getShop);
router.post('/list', ShopController.findAllShop);
router.post('/findNearestShop', ShopController.findNearestShop);
router.post('/count',ShopController.getShopCount);
// router.put('/update/:id',auth(PLATFORM.USERAPP), ShopController.updateShop);
// router.put('/update-like/:id',auth(PLATFORM.USERAPP), ShopController.updateShopLike);
// router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), ShopController.softDeleteShop);
// router.delete('/delete/:id',auth(PLATFORM.USERAPP),ShopController.deleteShop);


module.exports = router;


