const express = require('express');
const reviewProcessController = require('../controller/reviewProcess');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

// Chief Editor get all Editors
router.get('/editors', checkAuth, reviewProcessController.getAllEditors);
router.put('/assign-editor', checkAuth, reviewProcessController.assignEditor);

// All Roles: get Editor Assignment
router.get('/editor-assignment/:submissionId', reviewProcessController.getEditorAssignment);

module.exports = router;