const express = require('express');
const reviewProcessController = require('../controller/reviewProcess');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

// CE get all Editors
router.get('/editors', checkAuth, reviewProcessController.getAllEditors);
router.put('/assign-editor', checkAuth, reviewProcessController.assignEditor);

module.exports = router;