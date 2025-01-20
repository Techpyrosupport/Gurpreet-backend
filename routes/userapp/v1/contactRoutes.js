const express = require("express");
const { addContact } = require("../../../controller/userapp/v1/contactController");


const router = express.Router();

router.post("/create",addContact);


module.exports = router;