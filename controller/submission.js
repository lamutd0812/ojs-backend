const Submission = require('../model/submission');
const Category = require('../model/category');
const Stage = require('../model/stage');
const Notification = require('../model/notification');
const { StatusCodes } = require('http-status-codes');
const { STAGE, NOTIFICATION_TYPE } = require('../config/constant');
const logTemplates = require('../utils/log-templates');

const { deleteFile } = require('../services/file-services');

const ITEMS_PER_PAGE = 4;

exports.getAllSubmissions = async (req, res) => {
    const page = +req.query.page || 1;
    try {
        const total = await Submission.countDocuments();
        const submissions = await Submission
            .find()
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'stageId', select: 'name value -_id' })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ _id: -1 })
            .exec();

        res.status(StatusCodes.OK).json({
            submissions: submissions,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getSubmissionsByAuthor = async (req, res) => {
    const page = +req.query.page || 1;
    const authorId = req.params.authorId;
    try {
        const total = await Submission.countDocuments({ authorId: authorId });
        const submissions = await Submission.find({ authorId: authorId })
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'stageId', select: 'name value -_id' })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ _id: -1 })
            .exec();
        res.status(StatusCodes.OK).json({
            submissions: submissions,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getSubmissionById = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const submission = await Submission.findById(submissionId)
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'stageId', select: 'name value -_id' })
            .exec();
        res.status(StatusCodes.OK).json({ submission: submission });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

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
            const log = {
                event: logTemplates.authorSubmitArticle(req.user.fullname),
                createdAt: new Date()
            };
            logs.push(log);

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
                stageId: submissionStage._id,
                submissionLogs: logs
            });
            const newSubmission = await submission.save();

            // push noti
            const noti = new Notification({
                senderId: authorId,
                senderAvatar: req.user.avatar,
                type: NOTIFICATION_TYPE.AUTHOR_TO_CHIEF_EDITOR,
                title: 'Bài báo mới',
                content: 'Tác giả ' + req.user.fullname + ' đã submit bài báo lên hệ thống.',
                link: '/dashboard/submission/' + newSubmission._id
            });
            await noti.save();

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
            const log = {
                event: logTemplates.authorUpdateArticle(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);

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

