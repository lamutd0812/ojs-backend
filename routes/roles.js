const express = require('express');
const roleController = require('../controller/roles');

const router = express.Router();

router.get('/', roleController.getAllUserRoles);  
router.get('/:roleId', roleController.getUserRoleById);
router.post('/', roleController.addUserRole);
router.put('/:roleId', roleController.updateUserRole);
router.delete('/:roleId', roleController.deleteUserRole);

module.exports = router;