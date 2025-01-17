const express = require('express');
const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { addTopic, getTopic, findAllTopics, getTopicCount, updateTopic, softDeleteTopic, deleteTopic } = require('../../../controller/admin/v1/topicController');

const router = express.Router();


router.post('/create',auth(PLATFORM.ADMIN),addTopic);
router.get('/get/:id',auth(PLATFORM.ADMIN), getTopic);
router.post('/list',auth(PLATFORM.ADMIN), findAllTopics);
router.get('/count',auth(PLATFORM.ADMIN),getTopicCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), updateTopic);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN),softDeleteTopic);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),deleteTopic);


module.exports = router;