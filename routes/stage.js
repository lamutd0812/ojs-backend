const express = require('express');
const { USER_ROLES } = require('../config/constant');
const stageController = require('../controller/stage');
const { checkAuth, restrict } = require('../middlewares/check-auth');

const router = express.Router();

router.get('/', stageController.getAllStages);
router.get('/:stageId', stageController.getStageById);
router.post('/', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), stageController.addStage);
router.put('/:roleId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), stageController.updateStage);
router.delete('/:roleId', checkAuth, restrict([USER_ROLES.ADMIN.permissionLevel]), stageController.deleteStage);

module.exports = router;