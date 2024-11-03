const express = require('express');
const campaignController = require('../controllers/campaignController');
const authDoctor = require('../controllers/authDoctorController');

const router = express.Router({mergeParams: true});

router.route('/')
    .get(campaignController.getAllCampaigns)
    .post(campaignController.uploadCampaignMedia, campaignController.createCampaign);

// router.route('/:doctorId').get(authDoctor.isLoggedIn, campaignController.getDoctorCampaigns)


module.exports = router;