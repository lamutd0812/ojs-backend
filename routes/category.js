const express = require('express');
const { USER_ROLES } = require('../config/constant');
const categoryController = require('../controller/category');
const { checkAuth, restrict } = require('../middlewares/check-auth');

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getCategoryById);
router.post('/', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), categoryController.addCategory);
router.put('/:categoryId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), categoryController.updateCategory);
router.delete('/:categoryId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), categoryController.deleteCategory);

module.exports = router;