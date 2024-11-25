const express = require('express');
const authUserController = require('../controllers/authUserController');
const userController = require('../controllers/userController');
const messageRoutes = require('./campaignRoutes');

const router = express.Router();

router.use('/:userId/messages', messageRoutes);

router.route('/').get(userController.getAllUsers);

router.route('/user-signup')
    .post(authUserController.uploadUserAvatar,
        // authUserController.resizeImage,
        authUserController.userSignUp);
router.route('/login').post(authUserController.userLogin);
router.route('/forgotPassword').post(authUserController.forgetPassword);
router.route('/resetPassword/:token').patch(authUserController.resetPassword);


router.use(authUserController.isLoggedIn)
router.route('/logout').get(authUserController.userLogout);
router.route('/me').get(userController.userGetMe);
router.route('/deleteMe').post(userController.userDeleteMe);

module.exports = router;
