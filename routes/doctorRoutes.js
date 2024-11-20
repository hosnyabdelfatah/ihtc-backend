const express = require('express');
const authDoctorController = require('../controllers/authDoctorController');
const doctorController = require('../controllers/doctorController');
const messageRoutes = require('./campaignRoutes');

const router = express.Router();

router.use('/:doctorId/messages', messageRoutes);

router.route('/').get(doctorController.getAllDoctors);

router.route('/doctor-signup')
    .post(authDoctorController.uploadDoctorImage,
        // authDoctorController.resizeImage,
        authDoctorController.doctorSignUp);
router.route('/login').post(authDoctorController.doctorLogin);
router.route('/forgotPassword').post(authDoctorController.forgetPassword);
router.route('/resetPassword/:token').patch(authDoctorController.resetPassword);


router.use(authDoctorController.isLoggedIn)
router.route('/logout').get(authDoctorController.doctorLogout);
router.route('/me').get(doctorController.doctorGetMe);
router.route('/deleteMe').post(doctorController.doctorDeleteMe);

module.exports = router;
