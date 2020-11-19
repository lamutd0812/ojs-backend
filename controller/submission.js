const Submission = require('../model/submission');
// const SubmissionStatus = require('../model/submission_status');
const SubmissionLog = require('../model/submission_log');
const Category = require('../model/category');
const Stage = require('../model/stage');
const { StatusCodes } = require('http-status-codes');
const { STAGE, SUBMISSION_STATUS } = require('../config/constant');
const logTemplates = require('../utils/log-templates');

const { deleteFile } = require('../services/file-services');

exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ _id: -1 })
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'submissionStatus.stageId', select: 'name value -_id' })
            .populate({ path: 'submissionLogs', select: 'event createdAt -_id', options: { sort: { _id: -1 } } })
            .exec();
        res.status(StatusCodes.OK).json({ submissions: submissions });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
            .populate({ path: 'submissionStatus.stageId', select: 'name value -_id' })
            .populate({ path: 'submissionLogs', select: 'event createdAt -_id', options: { sort: { _id: -1 } } })
            .exec();
        res.status(StatusCodes.OK).json({ submissions: submissions });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
            .populate({ path: 'submissionStatus.stageId', select: 'name value -_id' })
            .populate({ path: 'submissionLogs', select: 'event createdAt -_id', options: { sort: { _id: -1 } } })
            .exec();
        res.status(StatusCodes.OK).json({ submission: submission });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: req.error
        });
    } else {
        try {
            const submissionStage = await Stage.findOne({ value: STAGE.SUBMISSION.value });

            // create logs
            let logs = [];
            const log = new SubmissionLog({
                event: logTemplates.authorSubmitArticle(req.user.fullname),
                createdAt: new Date()
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
            res.status(StatusCodes.CREATED).json({ submission: newSubmission });
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: err
            });
        }
    }
};

exports.updateSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    let categoryId = req.body.categoryId;
    const title = req.body.title;
    const abstract = req.body.abstract;

    try {
        const submission = await Submission.findById(submissionId);

        if (categoryId === "") {
            categoryId = submission.categoryId.toString();
        }
        if (req.error) { // in file-service upload error.
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: req.error
            });
        } else {
            submission.categoryId = categoryId;
            submission.title = title;
            submission.abstract = abstract;
            if (req.file) {
                // delete current attachmentUrl
                const result = deleteFile(submission.attachmentUrl);
                if (result.error) {
                    res.status(StatusCodes.NOT_FOUND).json({
                        message: "Delete Attachment Failed.",
                        error: result.error
                    });
                } else {
                    submission.attachmentFile = req.file.originalname;
                    submission.attachmentUrl = req.file.location;
                }
            }

            // update logs
            const log = new SubmissionLog({
                event: logTemplates.authorUpdateArticle(req.user.fullname),
                createdAt: new Date()
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);

            const updatedSubmission = await submission.save();
            res.status(StatusCodes.OK).json({ submission: updatedSubmission });
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.deleteSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const submission = await Submission.findById(submissionId);
        const result = deleteFile(submission.attachmentUrl);
        if (result.error) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Delete Attachment Failed.",
                error: result.error
            });
        } else {
            // delete submission
            await Submission.findByIdAndDelete(submissionId);
            // delete logs of this submission.
            submission.submissionLogs.forEach(async logId => {
                await SubmissionLog.findByIdAndDelete(logId);
            });
            res.status(StatusCodes.OK).json({
                message: "Submission Deleted.",
            });
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};
