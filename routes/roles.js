const express = require('express');
const { USER_ROLES } = require('../config/constant');
const roleController = require('../controller/roles');
const { checkAuth, restrict } = require('../middlewares/check-auth');

const router = express.Router();

router.get('/', roleController.getAllUserRoles);
router.get('/:roleId', roleController.getUserRoleById);
router.post('/', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), roleController.addUserRole);
router.put('/:roleId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), roleController.updateUserRole);
router.delete('/:roleId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), roleController.deleteUserRole);

module.exports = router;