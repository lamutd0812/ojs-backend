const express = require('express');
const submissionController = require('../controller/submission');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

const { uploadFile } = require('../services/file-services');

router.get('/', checkAuth, submissionController.getAllSubmissions);
router.get('/:submissionId', checkAuth, submissionController.getSubmissionById);
router.get('/author/:authorId', checkAuth, submissionController.getSubmissionsByAuthor);
router.post('/', checkAuth, uploadFile.single('attachment'), submissionController.createNewSubmission);
router.put('/:submissionId', uploadFile.single('attachment'));
router.delete('/:submissionId', submissionController.deleteSubmission);

module.exports = router;