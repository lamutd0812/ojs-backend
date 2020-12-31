const express = require('express');
const { USER_ROLES } = require('../config/constant');
const typeController = require('../controller/submisisonType');
const { checkAuth, restrict } = require('../middlewares/check-auth');

const router = express.Router();

router.get('/', typeController.getAllTypess);
router.get('/:typeId', typeController.getTypeById);
router.post('/', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), typeController.addType);
router.put('/:typeId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), typeController.updateType);
router.delete('/:typeId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), typeController.deleteType);

module.exports = router;