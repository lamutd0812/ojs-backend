const express = require('express');
const submissionController = require('../controller/submission');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

const upload = require('../services/file-upload');

router.get('/', checkAuth, submissionController.getAllSubmissions);
router.get('/:submissionId', checkAuth, submissionController.getSubmissionById);
router.get('/author/:authorId', checkAuth, submissionController.getSubmissionsByAuthor);
router.post('/', checkAuth, upload.single('attachment'), submissionController.createNewSubmission);

module.exports = router;