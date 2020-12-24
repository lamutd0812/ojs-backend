const express = require('express');
const { USER_ROLES } = require('../config/constant');
const reviewProcessController = require('../controller/reviewProcess');
const { checkAuth, restrict } = require('../middlewares/check-auth');
const { uploadFile } = require('../services/file-services');

const router = express.Router();

// Chief Editor get all Editors
router.get('/editors',
    checkAuth,
    restrict([USER_ROLES.CHIEF_EDITOR.permissionLevel]),
    reviewProcessController.getAllEditors);

// Chief Editor assign Editor
router.put('/assign-editor',
    checkAuth,
    restrict([USER_ROLES.CHIEF_EDITOR.permissionLevel]),
    reviewProcessController.assignEditor);

// All role: Get Editor Assignment of Submisison
router.get('/editor-assignments/:submissionId',
    checkAuth,
    reviewProcessController.getEditorAssignmentBySubmission);

// Editor: get all submission and assignment that assigned
router.get('/editor-assignments/my/all',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel]),
    reviewProcessController.getMyEditorAssignments);

// Editor get all Reviewers
router.get('/reviewers',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel]),
    reviewProcessController.getAllReviewers);

// Editor assign Reviewer
router.put('/assign-reviewer',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel]),
    reviewProcessController.assignReviewer);

// Reviewer: get all reviewer assignments that assigned
router.get('/reviewer-assignments/my/all',
    checkAuth,
    restrict([USER_ROLES.REVIEWER.permissionLevel]),
    reviewProcessController.getMyReviewerAssignments);

// Reviewer: get reviewer assignment detail
router.get('/reviewer-assignments/my/:submissionId',
    checkAuth,
    restrict([USER_ROLES.REVIEWER.permissionLevel]),
    reviewProcessController.getMyReviewerAssignmentBySubmission);

// Reviewer: create review for a submission
router.post('/reviewer-submission/:submissionId',
    checkAuth,
    restrict([USER_ROLES.REVIEWER.permissionLevel]),
    uploadFile.single('attachment'),
    reviewProcessController.createReviewerSubmission);

// Reviewer: edit review submission
router.put('/reviewer-submission/:submissionId',
    checkAuth,
    restrict([USER_ROLES.REVIEWER.permissionLevel]),
    uploadFile.single('attachment'),
    reviewProcessController.editReviewerSubmission);

// Editor: submit review for a submission
router.post('/editor-submission/:submissionId',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel]),
    uploadFile.single('attachment'),
    reviewProcessController.createEditorSubmission);

// Editor: edit review for a submission
router.put('/editor-submission/:submissionId',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel]),
    uploadFile.single('attachment'),
    reviewProcessController.editEditorSubmission);

// Editor: Request Author to Revise Submission (Create Author Assignment)
router.post('/request-author-revision/:submissionId',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel]),
    reviewProcessController.requestSubmissionRevision);

// Author and Editor get Author Assignment
router.get('/author-assignment/:submissionId',
    checkAuth,
    restrict([USER_ROLES.EDITOR.permissionLevel, USER_ROLES.AUTHOR.permissionLevel]),
    reviewProcessController.getAuthorAssignmentBySubmission
);

// Author Submit Revision of a Submission
router.put('/author-assignment/:submissionId',
    checkAuth,
    restrict([USER_ROLES.AUTHOR.permissionLevel]),
    uploadFile.single('attachment'),
    reviewProcessController.authorSubmitRevision);

// Chief Editor Accept Submission
router.put('/accept-submission/:submissionId',
    checkAuth,
    restrict([USER_ROLES.CHIEF_EDITOR.permissionLevel]),
    reviewProcessController.acceptSubmission);

// Chief Editor Decline Submission
router.put('/decline-submission/:submissionId',
    checkAuth,
    restrict([USER_ROLES.CHIEF_EDITOR.permissionLevel]),
    reviewProcessController.declineSubmission);

// All: Get EditorSubmission
router.get('/chief-editor-submission/:submissionId',
    checkAuth,
    reviewProcessController.getCESubmission);

module.exports = router;