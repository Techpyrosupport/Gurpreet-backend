const express =require("express")
const path = require('path');
const { compileCode } = require("../../../controller/userapp/v1/codeController");

const router = express.Router()



router.post("/compile",compileCode );


  module.exports= router