const Submission = require('../model/submission');
const SubmissionStatus = require('../model/submission_status');
const Stage = require('../model/stage');
const config = require('../config/config');
const { STAGE, SUBMISSION_STATUS } = require('../config/constant');

exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find();
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
        const submissions = await Submission.find({ authorId: authorId });
        res.status(200).json({ submissions: submissions });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.createNewSubmission = async (req, res) => {
    // console.log(req.file);
    // console.log(req.user);
    const categoryId = req.body.categoryId;
    const title = req.body.title;
    const abstract = req.body.abstract;
    let attachmentFile = '';
    let attachmentUrl = '';
    const authorId = req.user.userId;
    if (!req.file) {
        res.status(500).json({
            error: 'Chỉ được upload file dạng .pdf/.doc/.docx!'
        });
    } else {
        attachmentFile = req.file.originalname;
        attachmentUrl = req.file.location;
        try {
            const submissionStage = await Stage.findOne({ value: STAGE.SUBMISSION.value });
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
                }
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