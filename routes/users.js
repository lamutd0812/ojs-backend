const express = require('express');
const usersController = require('../controller/users');
const { checkAuth } = require('../middlewares/check-auth');
const { uploadImage } = require('../services/image-services');

const router = express.Router();

router.get('/:userId', usersController.getUserInfor);

router.put('/update-infor/my',
    checkAuth,
    usersController.updateMyUserInfor);

router.put('/change-password',
    checkAuth,
    usersController.changePassword);

router.put('/change-avatar',
    checkAuth,
    uploadImage.single('avatar'),
    usersController.changeAvatar);

module.exports = router;