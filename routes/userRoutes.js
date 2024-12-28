const express = require('express');
const authUserController = require('../controllers/authUserController');
const userController = require('../controllers/userController');
const refreshUserController = require('../controllers/userRefreshTokenController');
const messageRoutes = require('./campaignRoutes');

const router = express.Router();

router.use('/:userId/messages', messageRoutes);

router.route('/').get(userController.getAllUsers);

router.route('/user-signup')
    .post(authUserController.uploadUserAvatar,
        // authUserController.resizeImage,
        authUserController.userSignUp);
router.route('/login').post(authUserController.userLogin);
router.route('/forgetPassword').post(authUserController.forgetPassword);
router.route('/resetPassword/:token').patch(authUserController.resetPassword);
router.route('/updatePassword').patch(authUserController.updatePassword);
router.route("/userRefresh").get(refreshUserController.handleUserRefreshToken)


// router.use(authUserController.isLoggedIn)
router.route('/logout').get(authUserController.userLogout);
router.route('/me/:id').get(userController.userGetMe);
router.route('/updateMe/:id').patch(userController.userUpdateMe);
router.route('/updateAvatar/:id').patch(authUserController.uploadUserAvatar, authUserController.updateAvatar);
router.route('/deleteMe').post(userController.userDeleteMe);

module.exports = router;
