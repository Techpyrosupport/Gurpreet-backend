const express = require('express');
const auth = require('../../../middleware/auth');
const { PLATFORM } = require('../../../constants/authConstant');
const { addVideo, getVideo, findAllVideos, getVideoCount, updateVideo, softDeleteVideo, deleteVideo } = require('../../../controller/admin/v1/videoController');

const router = express.Router();


router.post('/create',auth(PLATFORM.ADMIN),addVideo);
router.get('/get/:id',auth(PLATFORM.ADMIN), getVideo);
router.post('/list',auth(PLATFORM.ADMIN), findAllVideos);
router.get('/count',auth(PLATFORM.ADMIN),getVideoCount);
router.put('/update/:id',auth(PLATFORM.ADMIN), updateVideo);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN),softDeleteVideo);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),deleteVideo);


module.exports = router;