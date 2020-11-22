const express = require('express');
const { USER_ROLES } = require('../config/constant');
const submissionController = require('../controller/submission');
const { checkAuth, restrict } = require('../middlewares/check-auth');
const { uploadFile } = require('../services/file-services');

const router = express.Router();

// Chief Editor Get All Submission
router.get('/',
    checkAuth,
    restrict([USER_ROLES.CHIEF_EDITOR.permissionLevel]),
    submissionController.getAllSubmissions);

// Author, Editor, Reviewer
router.get('/:submissionId',
    checkAuth,
    restrict([USER_ROLES.AUTHOR.permissionLevel, USER_ROLES.REVIEWER.permissionLevel, USER_ROLES.EDITOR.permissionLevel, USER_ROLES.CHIEF_EDITOR.permissionLevel]),
    submissionController.getSubmissionById);

// Author, Editor, Reviewer
router.get('/author/:authorId',
    checkAuth,
    restrict([USER_ROLES.AUTHOR.permissionLevel, USER_ROLES.REVIEWER.permissionLevel, USER_ROLES.EDITOR.permissionLevel]),
    submissionController.getSubmissionsByAuthor);

// Author
router.post('/',
    checkAuth,
    restrict([USER_ROLES.AUTHOR.permissionLevel, USER_ROLES.REVIEWER.permissionLevel, USER_ROLES.EDITOR.permissionLevel]),
    uploadFile.single('attachment'),
    submissionController.createNewSubmission);

// Author
router.put('/:submissionId',
    checkAuth,
    restrict([USER_ROLES.AUTHOR.permissionLevel, USER_ROLES.REVIEWER.permissionLevel, USER_ROLES.EDITOR.permissionLevel]),
    uploadFile.single('attachment'),
    submissionController.updateSubmission);

// Author
router.delete('/:submissionId',
    checkAuth,
    restrict([USER_ROLES.AUTHOR.permissionLevel, USER_ROLES.REVIEWER.permissionLevel, USER_ROLES.EDITOR.permissionLevel]),
    submissionController.deleteSubmission);

module.exports = router;