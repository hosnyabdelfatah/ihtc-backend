const express = require('express');
const campaignController = require('../controllers/campaignController');
// const authDoctor = require('../controllers/authDoctorController');

const router = express.Router({mergeParams: true});

router.route('/:organizationId')
    .get(campaignController.getAllCampaigns)
    .post(campaignController.uploadCampaignMedia, campaignController.createCampaign);

router.route('/campaignDetails/:campaignId').get(campaignController.getOneCampaign)
// router.route('/:doctorId').get(authDoctor.isLoggedIn, campaignController.getDoctorCampaigns)


module.exports = router;