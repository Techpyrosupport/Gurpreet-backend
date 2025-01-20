const express = require('express');
const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { addContact, getContact, findAllContacts, getContactCount, updateContact, softDeleteContact, deleteContact, deleteManyContact } = require('../../../controller/admin/v1/contactController');

const router = express.Router();


router.post('/create',auth(PLATFORM.ADMIN),addContact);
router.get('/get/:id',auth(PLATFORM.ADMIN), getContact);
router.post('/list',auth(PLATFORM.ADMIN), findAllContacts);
router.get('/count',auth(PLATFORM.ADMIN),getContactCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), updateContact);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN),softDeleteContact);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),deleteContact);
router.delete('delete-many ',auth(PLATFORM.ADMIN),deleteManyContact);


module.exports = router;