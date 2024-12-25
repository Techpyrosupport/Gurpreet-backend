const express = require("express");
const router = express.Router();
const IpController = require("../../../controller/userapp/v1/ipController");



router.post('/create',IpController.addIp);
router.put('/update/:id',IpController.updateIp);


module.exports = router;


