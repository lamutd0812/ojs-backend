const Submission = require('../model/submission');
// const SubmissionStatus = require('../model/submission_status');
const SubmissionLog = require('../model/submission_log');
const Category = require('../model/category');
const Stage = require('../model/stage');
const { STAGE, SUBMISSION_STATUS } = require('../config/constant');
const logTemplates = require('../utils/log-templates');

const { deleteFile } = require('../services/file-services');

exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ _id: -1 })
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'submissionStatus.stageId', select: 'name value' })
            .populate({ path: 'submissionLogs', select: 'event createdAt -_id' })
        res.status(200).json({ submissions: submissions });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.getSubmissionsByAuthor = async (req, res) => {
    const authorId = req.params.authorId;
    try {
        const submissions = await Submission.find({ authorId: authorId }).sort({ _id: -1 })
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'submissionStatus.stageId', select: 'name value' })
            .populate({ path: 'submissionLogs', select: 'event createdAt -_id' })
        res.status(200).json({ submissions: submissions });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.getSubmissionById = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const submission = await Submission.findById(submissionId)
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'submissionStatus.stageId', select: 'name value' })
            .populate({ path: 'submissionLogs', select: 'event createdAt -_id' })
        res.status(200).json({ submission: submission });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.createNewSubmission = async (req, res) => {
    let categoryId = req.body.categoryId;
    const title = req.body.title;
    const abstract = req.body.abstract;
    let attachmentFile = '';
    let attachmentUrl = '';
    const authorId = req.user.userId;

    if (categoryId === "") {
        const category = await Category.find().limit(1);
        categoryId = category[0]._id;
    }

    if (req.error) {
        res.status(500).json({
            error: req.error
        });
    } else {
        try {
            const submissionStage = await Stage.findOne({ value: STAGE.SUBMISSION.value });

            let logs = [];
            const log = new SubmissionLog({
                event: logTemplates.authorSubmitArticle(req.user.fullname)
            });
            const newLog = await log.save();
            logs.push(newLog._id);

            if (req.file) {
                attachmentFile = req.file.originalname;
                attachmentUrl = req.file.location;
            }
            const submission = new Submission({
                categoryId: categoryId,
                title: title,
                abstract: abstract,
                attachmentFile: attachmentFile,
                attachmentUrl: attachmentUrl,
                authorId: authorId,
                submissionStatus: {
                    status: SUBMISSION_STATUS.AUTHOR_SUBMIT_SUCCESS,
                    stageId: submissionStage._id
                },
                submissionLogs: logs
            });
            const newSubmission = await submission.save();
            res.status(200).json({ submission: newSubmission });
        } catch (err) {
            res.status(500).json({
                error: err
            });
            console.log(err);
        }
    }
};

exports.updateSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    let categoryId = req.body.categoryId;
    const title = req.body.title;
    const abstract = req.body.abstract;

    const submission = await Submission.findById(submissionId);

    if (categoryId === "") {
        categoryId = submission.categoryId.toString();
    }
    if (req.error) {
        res.status(500).json({
            error: req.error
        });
    } else {
        try {
            submission.categoryId = categoryId;
            submission.title = title;
            submission.abstract = abstract;
            if (req.file) {
                // delete current attachmentUrl
                deleteFile(submission.attachmentUrl);
                submission.attachmentFile = req.file.originalname;
                submission.attachmentUrl = req.file.location;
            }

            // update log
            const log = new SubmissionLog({
                event: logTemplates.authorUpdateArticle(req.user.fullname)
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);

            const updatedSubmission = await submission.save();
            res.status(200).json({ submission: updatedSubmission });
        } catch (err) {
            res.status(500).json({
                error: err
            });
            console.log(err);
        }
    }

};

exports.deleteSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const submission = await Submission.findById(submissionId);
        const result = deleteFile(submission.attachmentUrl);
        if (result.error) {
            res.status(404).json({
                message: "Delete Attachment Failed.",
                error: result.error
            });
        } else {
            await Submission.findByIdAndDelete(submissionId);
            res.status(200).json({
                message: "Submission Deleted.",
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};