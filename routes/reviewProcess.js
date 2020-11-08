const express = require('express');
const reviewProcessController = require('../controller/reviewProcess');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

// Chief Editor get all Editors
router.get('/editors', checkAuth, reviewProcessController.getAllEditors);
router.put('/assign-editor', checkAuth, reviewProcessController.assignEditor);

// Chief Editor: get Editor Assignment of Submisison
router.get('/editor-assignments/:submissionId', checkAuth, reviewProcessController.getEditorAssignmentBySubmission);

// Editor: get all submission and assignment that assigned
router.get('/editor-assignments/my/all',checkAuth, reviewProcessController.getMyEditorAssignments);

module.exports = router;