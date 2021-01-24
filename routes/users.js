const express = require('express');
const { USER_ROLES } = require('../config/constant');
const usersController = require('../controller/users');
const { checkAuth, restrict } = require('../middlewares/check-auth');
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

// Admin get All User
router.get('/infor/all',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    usersController.getAllUserInfor);

// Admin change user role
router.put('/role/:userId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    usersController.changeUserRole);

module.exports = router;