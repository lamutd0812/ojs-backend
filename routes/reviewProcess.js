const express = require('express');
const reviewProcessController = require('../controller/reviewProcess');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

// Chief Editor get all Editors
router.get('/editors', checkAuth, reviewProcessController.getAllEditors);
// Chief Editor assign Editor
router.put('/assign-editor', checkAuth, reviewProcessController.assignEditor);

// All role: Get Editor Assignment of Submisison
router.get('/editor-assignments/:submissionId', checkAuth, reviewProcessController.getEditorAssignmentBySubmission);
// All role: Get Reviewer Assignment of Submisison
router.get('/reviewer-assignments/:submissionId', checkAuth, reviewProcessController.getReviewerAssignmentsBySubmission);

// Editor: get all submission and assignment that assigned
router.get('/editor-assignments/my/all',checkAuth, reviewProcessController.getMyEditorAssignments);
// Editor get all Reviewers
router.get('/reviewers', checkAuth, reviewProcessController.getAllReviewers);
// Editor assign Reviewer
router.put('/assign-reviewer', checkAuth, reviewProcessController.assignReviewer);

// Reviewer: get all reviewer assignments that assigned
router.get('/reviewer-assignments/my/all',checkAuth, reviewProcessController.getMyReviewerAssignments);
// Reviewer: get reviewer assignment detail
router.get('/reviewer-assignments/my/:submissionId',checkAuth, reviewProcessController.getMyReviewerAssignmentBySubmission);
// Reviewer: create review for a submission
router.post('/reviewer-submission/:submissionId', checkAuth, reviewProcessController.createReviewerSubmission);

module.exports = router;