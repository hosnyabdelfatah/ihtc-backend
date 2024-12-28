const express = require('express');
const authDoctorController = require('../controllers/authDoctorController');
const doctorController = require('../controllers/doctorController');
const refreshDoctor = require('../controllers/doctorRefreshTokenController');
const messageRoutes = require('./campaignRoutes');

const router = express.Router();

router.use('/:doctorId/messages', messageRoutes);

router.route('/').get(doctorController.getAllDoctors);

router.route('/doctor-signup')
    .post(authDoctorController.uploadDoctorImage,
        // authDoctorController.resizeImage,
        authDoctorController.doctorSignUp);
router.route('/login').post(authDoctorController.doctorLogin);
router.route('/forgetPassword').post(authDoctorController.forgetPassword);
router.route('/resetPassword/:token').patch(authDoctorController.resetPassword);
router.route("/doctorRefresh").get(refreshDoctor.handleDoctorRefreshToken);
router.route('/updatePassword').patch(authDoctorController.updatePassword);


// router.use(authDoctorController.isLoggedIn)
router.route('/logout').get(authDoctorController.doctorLogout);
router.route('/updateProfileImage/:id')
    .patch(authDoctorController.uploadDoctorImage, authDoctorController.updateAvatar);
router.route('/updateMe/:id').patch(doctorController.updateMe);


router.route('/deleteMe/:id').post(doctorController.doctorDeleteMe);
router.route('/me/:id').get(doctorController.doctorGetMe);
router.route('/:doctorId').get(doctorController.getDoctor);


module.exports = router;
