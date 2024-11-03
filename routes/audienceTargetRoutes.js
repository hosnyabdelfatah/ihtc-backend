const express = require('express');
const audienceTargetController = require('../controllers/audienceTargetController');
const campaignController = require('../controllers/campaignController');

const router = express.Router();

router.route('/').get(audienceTargetController.getAllAudience)

module.exports = router;