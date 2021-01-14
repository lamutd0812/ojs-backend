const express = require('express');
const authController = require('../controller/auth');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

// const uploadImage = require('../services/image-upload');

// router.put('/signup',uploadImage.single('avatar'), authController.signup);
router.put('/signup', authController.signup);
router.post('/signin', authController.signin);

// All Roles: Get My Notification: Limit 6
router.get('/notifications/my',
    checkAuth,
    authController.getMyNotifications);

// All Roles: Get My Notification: Limit 6
router.get('/notifications/my/all',
    checkAuth,
    authController.getAllMyNotifications);

module.exports = router;