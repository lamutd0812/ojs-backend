const express = require('express');
const usersController = require('../controller/users');
const { checkAuth } = require('../middlewares/check-auth');
const { uploadImage } = require('../services/image-services');

const router = express.Router();

router.get('/my',
    checkAuth,
    usersController.getMyUserInfor);

router.get('/:userId', usersController.getUserInfor);

router.put('/update-infor',
    checkAuth,
    usersController.updateMyUserInfor);

router.put('/change-password',
    checkAuth,
    usersController.changePassword);

router.put('/change-avatar',
    checkAuth,
    uploadImage.single('avatar'),
    usersController.changeAvatar);

router.get('/all/preference-categories',
    usersController.getAllPreferenceCategories);

module.exports = router;