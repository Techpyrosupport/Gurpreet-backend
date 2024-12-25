const express = require("express");
const router = express.Router();
const IpController = require("../../../controller/admin/v1/ipController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");



router.post('/create',auth(PLATFORM.ADMIN),IpController.addIp);
router.get('/get/:id',auth(PLATFORM.ADMIN), IpController.getIp);
router.post('/list',auth(PLATFORM.ADMIN), IpController.findAllIp);
router.post('/count',auth(PLATFORM.ADMIN),IpController.getIpCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), IpController.updateIp);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), IpController.softDeleteIp);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),IpController.deleteIp);
router.post('/deleteMany',auth(PLATFORM.ADMIN),IpController.deleteManyIp);
router.put('/softDeleteMany',auth(PLATFORM.ADMIN),IpController.softDeleteManyIp);


module.exports = router;


