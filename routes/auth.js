const express = require('express');
const authController = require('../controller/auth');

const router = express.Router();

// const uploadImage = require('../services/image-upload');

// router.put('/signup',uploadImage.single('avatar'), authController.signup);
router.put('/signup', authController.signup);
router.post('/signin', authController.signin);

module.exports = router;