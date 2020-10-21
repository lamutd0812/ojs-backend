const express = require('express');
const stageController = require('../controller/stage');

const router = express.Router();

router.get('/', stageController.getAllStages);
router.get('/:stageId', stageController.getStageById);
router.post('/', stageController.addStage);
router.put('/:roleId', stageController.updateStage);
router.delete('/:roleId', stageController.deleteStage);

module.exports = router;