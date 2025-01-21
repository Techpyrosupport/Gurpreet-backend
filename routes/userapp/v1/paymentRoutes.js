const express = require('express');
const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const paymentController = require('../../../controller/userapp/v1/paymentController');


const router = express.Router();


router.post('/create',auth(PLATFORM.USERAPP),paymentController.addPayment);
router.get('/get/:id',auth(PLATFORM.USERAPP), paymentController.getPayment);
router.post('/checkout',auth(PLATFORM.USERAPP),paymentController.checkout);
router.post('/paymentVerify',paymentController.paymentVerify);
module.exports = router;

