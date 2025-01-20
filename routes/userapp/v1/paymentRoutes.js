const express = require('express');
const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { checkout } = require('../../../controller/userapp/v1/paymentController');


const router = express.Router();


router.post('/checkout',auth(PLATFORM.USERAPP),checkout);
module.exports = router;

