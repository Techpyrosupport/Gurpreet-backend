/**
 * @apiDefine aiResponseGroup AI Response
 * @api {post} /v1/aiResponseRoute/aiResponse  AI Response
 * 
 *  @description :: routes for authentications of APIs
 */



const express = require("express");
const router = express.Router();
const auth = require('../../../middleware/auth');
const { streamChatResponse, findAllChatHistory } = require("../../../controller/userapp/v1/openAiController");
const { PLATFORM } = require("../../../constants/authConstant");



router.post('/chat',auth(PLATFORM.USERAPP),streamChatResponse);
router.post('/chat-history',auth(PLATFORM.USERAPP),findAllChatHistory);

module.exports = router;