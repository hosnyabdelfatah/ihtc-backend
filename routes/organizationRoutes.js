const express = require('express');
const authOrganizationController = require('../controllers/authOrganizationController');
const organizationController = require('../controllers/organiztionController');
const organizationRefreshTokenController = require('../controllers/organizationRefreshTokenController')
const campaignRouter = require('./campaignRoutes');
const authDoctorController = require("../controllers/authDoctorController");

const router = express.Router();

router.use('/:organizationId/campaigns', campaignRouter);

router.route('/').get(organizationController.getAllOrganizations)


router.route('/organization-signup').post(
    authOrganizationController.uploadOrganizationImages,
    authOrganizationController.organizationSignup
);

router.route('/login').post(authOrganizationController.organizationLogin);
router.route("/organizationRefresh").get(organizationRefreshTokenController.handleOrganizationRefreshToken);
router.route('/forgetPassword').post(authOrganizationController.forgetPassword);
router.route('/resetPassword/:token').patch(authOrganizationController.resetPassword);
router.route('/updatePassword').patch(authOrganizationController.updatePassword)

router.use(authOrganizationController.isLoggedIn);
// router.route('/campaigns').get(organizationController.allOrganizationMessages);
router.route('/organizationGetMe').get(organizationController.organizationGetMe);
router.route('/logout').get(authOrganizationController.logout);

module.exports = router