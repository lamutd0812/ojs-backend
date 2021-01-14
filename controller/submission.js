const Submission = require('../model/submission');
const Category = require('../model/category');
const SubmissionType = require('../model/submission_type');
const Stage = require('../model/stage');
const Notification = require('../model/notification');
const { StatusCodes } = require('http-status-codes');
const { STAGE, NOTIFICATION_TYPE } = require('../config/constant');
const logTemplates = require('../utils/log-templates');

const { deleteFile } = require('../services/file-services');

exports.getAllSubmissions = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const total = await Submission.countDocuments();
        const submissions = await Submission
            .find()
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'typeId', select: 'name' })
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
            error: "Internal Server Error."
        });
    }
};

exports.getSubmissionsByAuthor = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    const authorId = req.params.authorId;
    try {
        const total = await Submission.countDocuments({ authorId: authorId });
        const submissions = await Submission.find({ authorId: authorId })
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'typeId', select: 'name' })
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
            error: "Internal Server Error."
        });
    }
};

exports.getSubmissionById = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const submission = await Submission.findById(submissionId)
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'typeId', select: 'name' })
            .populate({ path: 'stageId', select: 'name value -_id' })
            .exec();
        res.status(StatusCodes.OK).json({ submission: submission });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.createNewSubmission = async (req, res) => {
    let categoryId = req.body.categoryId;
    let typeId = req.body.typeId;
    const title = req.body.title;
    const abstract = req.body.abstract;
    let attachmentFile = '';
    let attachmentUrl = '';
    //with published research
    const magazineName = req.body.magazineName;
    const DOI = req.body.DOI;
    // metadata
    const contributors = JSON.parse(req.body.contributors);
    let metadata = [];

    const authorId = req.user.userId;

    if (categoryId === "") {
        const category = await Category.find().limit(1);
        categoryId = category[0]._id;
    }
    if (typeId === "") {
        const type = await SubmissionType.find().limit(1);
        typeId = type[0]._id;
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

            if (req.files.attachment) {
                attachmentFile = req.files.attachment[0].originalname;
                attachmentUrl = req.files.attachment[0].location;
            }
            if (req.files.metadata) {
                req.files.metadata.forEach(file => {
                    metadata.push({
                        url: file.location,
                        filename: file.originalname
                    });
                });
            }

            const submission = new Submission({
                categoryId: categoryId,
                typeId: typeId,
                title: title,
                abstract: abstract,
                attachmentFile: attachmentFile,
                attachmentUrl: attachmentUrl,
                authorId: authorId,
                stageId: submissionStage._id,
                submissionLogs: logs,
                contributors: contributors.data,
                metadata: metadata,
            });
            if (magazineName && DOI) {
                submission.magazineName = magazineName;
                submission.DOI = DOI;
            }
            const newSubmission = await submission.save();

            // push noti
            const noti = new Notification({
                senderId: authorId,
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
    let typeId = req.body.typeId;
    const title = req.body.title;
    const abstract = req.body.abstract;
    //with published research
    const magazineName = req.body.magazineName;
    const DOI = req.body.DOI;
    // metadata
    const contributors = JSON.parse(req.body.contributors);
    let metadata = [];

    const authorId = req.user.userId;

    try {
        const submission = await Submission.findById(submissionId);

        if (categoryId === "") {
            categoryId = submission.categoryId.toString();
        }
        if (typeId === "") {
            typeId = submission.typeId.toString();
        }

        if (req.error) { // in file-service upload error.
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: req.error
            });
        } else {
            submission.categoryId = categoryId;
            submission.typeId = typeId;
            submission.title = title;
            submission.abstract = abstract;
            submission.contributors = contributors.data;
            // with published research
            if (magazineName && DOI) {
                submission.magazineName = magazineName;
                submission.DOI = DOI;
            } else {
                submission.magazineName = null;
                submission.DOI = null;
            }
            
            if (req.files.attachment) {
                deleteFile(submission.attachmentUrl);
                submission.attachmentFile = req.files.attachment[0].originalname;
                submission.attachmentUrl = req.files.attachment[0].location;
            }
            if (req.files.metadata) {
                submission.metadata.forEach(file => {
                    deleteFile(file.url);
                });
                req.files.metadata.forEach(file => {
                    metadata.push({
                        url: file.location,
                        filename: file.originalname
                    });
                });
                submission.metadata = metadata;
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
            error: "Internal Server Error."
        });
    }
};

exports.deleteSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const submission = await Submission.findById(submissionId);
        deleteFile(submission.attachmentUrl);
        submission.metadata.forEach(file => {
            deleteFile(file.url);
        });
        await Submission.findByIdAndDelete(submissionId);
        res.status(StatusCodes.OK).json({
            message: "Submission Deleted.",
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.getSubmissionsByKeyword = async (req, res) => {
    const regex = new RegExp(req.query["keyword"], 'i');
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const total = await Submission.countDocuments({ title: regex });
        const submissions = await Submission
            .find({ title: regex })
            .populate({ path: 'authorId', select: 'firstname lastname' })
            .populate({ path: 'typeId', select: 'name' })
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
            error: "Internal Server Error."
        });
    }
};

