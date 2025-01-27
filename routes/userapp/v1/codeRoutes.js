const express =require("express")
const path = require('path');
const { compileCode,getCodeResponse } = require("../../../controller/userapp/v1/codeController");
const auth = require("../../../middleware/auth");
const { PLATFORM } = require("../../../constants/authConstant");

const router = express.Router()



router.post("/compile", auth(PLATFORM.USERAPP), compileCode );
router.get("/get/:id",auth(PLATFORM.USERAPP),getCodeResponse);


  module.exports= router