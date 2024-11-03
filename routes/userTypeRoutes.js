const express = require('express');
const userTypeController = require('../controllers/userTypeController');

const router = express.Router();


router.route('/')
    .get(userTypeController.getCurrentUserUserType)
    .post(userTypeController.useAppAs);

module.exports = router;