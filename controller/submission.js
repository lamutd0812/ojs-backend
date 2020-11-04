const Submission = require('../model/submission');
// const SubmissionStatus = require('../model/submission_status');
const SubmissionLog = require('../model/submission_log');
const Category = require('../model/category');
const Stage = require('../model/stage');
const { STAGE, SUBMISSION_STATUS } = require('../config/constant');
const logTemplates = require('../utils/log-templates');

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

    if (!req.file) {
        res.status(500).json({
            error: 'Chỉ được upload file dạng .pdf/.doc/.docx!'
        });
    } else {
        attachmentFile = req.file.originalname;
        attachmentUrl = req.file.location;
        try {
            const submissionStage = await Stage.findOne({ value: STAGE.SUBMISSION.value });

            let logs = [];
            const log = new SubmissionLog({
                event: logTemplates.authorSubmitArticle(req.user.fullname)
            });
            const newLog = await log.save();
            logs.push(newLog._id);

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