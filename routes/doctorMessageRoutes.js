const express = require('express');
const doctorMessageController = require('../controllers/doctorMessageController');

const router = express.Router();

router.route('/:doctorId').get(doctorMessageController.getAllDoctorMessagesOut)
router.route('/').post(doctorMessageController.uploadMessageMedia, doctorMessageController.createMessage);

module.exports = router;