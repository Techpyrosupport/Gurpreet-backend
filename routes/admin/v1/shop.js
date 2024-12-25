const express = require("express");
const router = express.Router();
const ShopController = require("../../../controller/admin/v1/shopController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");



router.post('/create',auth(PLATFORM.ADMIN),ShopController.addShop);
router.post('/addBulk',auth(PLATFORM.ADMIN),ShopController.bulkInsertShop);
router.get('/get/:id',auth(PLATFORM.ADMIN), ShopController.getShop);
router.post('/list',auth(PLATFORM.ADMIN), ShopController.findAllShop);
router.post('/count',auth(PLATFORM.ADMIN),ShopController.getShopCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), ShopController.updateShop);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), ShopController.softDeleteShop);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),ShopController.deleteShop);
router.post('/deleteMany',auth(PLATFORM.ADMIN),ShopController.deleteManyShop);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),ShopController.softDeleteManyShop);


module.exports = router;


