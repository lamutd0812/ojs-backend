const express = require('express');
const submissionController = require('../controller/submission');
const { checkAuth } = require('../middlewares/check-auth');
const { uploadFile } = require('../services/file-services');

const router = express.Router();

router.get('/', checkAuth, submissionController.getAllSubmissions);
router.get('/:submissionId', checkAuth, submissionController.getSubmissionById);
router.get('/author/:authorId', checkAuth, submissionController.getSubmissionsByAuthor);
router.post('/', checkAuth, uploadFile.single('attachment'), submissionController.createNewSubmission);
router.put('/:submissionId', checkAuth, uploadFile.single('attachment'), submissionController.updateSubmission);
router.delete('/:submissionId', checkAuth, submissionController.deleteSubmission);

module.exports = router;