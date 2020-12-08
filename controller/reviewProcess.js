const User = require('../model/user');
const UserRole = require('../model/user_role');
const Submission = require('../model/submission');
const Stage = require('../model/stage');
const EditorAssignment = require('../model/editor_assignment');
const EditorSubmission = require('../model/editor_submission');
const EditorDecision = require('../model/editor_decision');
const ReviewerAssignment = require('../model/reviewer_asignment');
const ReviewerSubmission = require('../model/reviewer_submission');
const ReviewerDecision = require('../model/reviewer_decision');
const AuthorAssignment = require('../model/author_assignment');
const AuthorRevision = require('../model/author_revision');
const ChiefEditorSubmission = require('../model/chief_editor_submission');
const ChiefEditorDecision = require('../model/chief_editor_decision');
const Article = require('../model/article');
const Notification = require('../model/notification');
const { StatusCodes } = require('http-status-codes');
const logTemplates = require('../utils/log-templates');
const { USER_ROLES, STAGE, CHIEF_EDITOR_DECISION, NOTIFICATION_TYPE } = require('../config/constant');

const { deleteFile } = require('../services/file-services');

const ITEMS_PER_PAGE = 4;

exports.getAllEditors = async (req, res) => {
    const submissionId = req.query.submissionId;
    try {
        let ids = [];
        // Not assign Editor if Editor is Submission's Author
        const submission = await Submission.findById(submissionId).select('authorId');
        ids.push(submission.authorId);

        const editorRole = await UserRole.findOne(USER_ROLES.EDITOR);
        const editors = await User.find({
            role: editorRole._id,
            _id: { $nin: ids }
        });
        res.status(StatusCodes.OK).json({ editors: editors });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.getAllReviewers = async (req, res) => {
    const submissionId = req.query.submissionId;
    try {
        // Only get Reviewers that not assigned for this submission yet.
        const reviewerAssignments = await ReviewerAssignment
            .find({ submissionId: submissionId })
            .select('reviewerId -_id');

        let ids = [];
        // Not Assign Reviewer if Reviewer is Submission's Author
        const submission = await Submission.findById(submissionId).select('authorId');
        ids.push(submission.authorId);
        reviewerAssignments.map(assignment => {
            return ids.push(assignment.reviewerId);
        });

        const reviewerRole = await UserRole.findOne(USER_ROLES.REVIEWER);
        const reviewers = await User.find({
            role: reviewerRole._id,
            _id: { $nin: ids }
        });
        res.status(StatusCodes.OK).json({ reviewers: reviewers });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.assignEditor = async (req, res) => {
    const chiefEditorId = req.user.userId;
    const submissionId = req.body.submissionId;
    const editorId = req.body.editorId;
    const dueDate = req.body.dueDate;
    const message = req.body.message;
    try {
        const prevEditorAssignment = await EditorAssignment.findOne({ submissionId: submissionId });
        if (prevEditorAssignment) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã được chỉ định cho bài báo này!' });
        }
        else {
            const submission = await Submission.findById(submissionId);
            const editorAssignment = new EditorAssignment({
                submissionId: submissionId,
                editorId: editorId,
                chiefEditorId: chiefEditorId,
                dueDate: Date.parse(dueDate),
                message: message,
                isAccepted: false
            });
            await editorAssignment.save();

            // update submission stage
            const reviewStage = await Stage.findOne(STAGE.REVIEW);
            submission.stageId = reviewStage._id;

            // add submission log
            const log = {
                event: logTemplates.chiefEditorAssignEditor(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            await submission.save();

            // push noti
            const noti = new Notification({
                senderId: chiefEditorId,
                senderAvatar: req.user.avatar,
                receiverId: editorId,
                type: NOTIFICATION_TYPE.CHIEF_EDITOR_TO_EDITOR,
                title: 'Yêu cầu thẩm định',
                content: 'Tổng biên tập ' + req.user.fullname + ' đã chỉ định bạn chủ trì thẩm định một bài báo.',
                link: '/dashboard/editor/assignment/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.OK).json({
                message: 'Chỉ định biên tập viên thành công!',
            });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.assignReviewer = async (req, res) => {
    const editorId = req.user.userId;
    const submissionId = req.body.submissionId;
    const reviewerId = req.body.reviewerId;
    const dueDate = req.body.dueDate;
    const message = req.body.message;
    try {
        const reviewerAssignments = await ReviewerAssignment.find({ submissionId: submissionId });
        const prevReviewerAssignment = reviewerAssignments.filter(ra =>
            (ra.submissionId.toString() === submissionId && ra.reviewerId.toString() === reviewerId)
        );
        const prevEditorAssignment = await EditorAssignment.findOne({ submissionId: submissionId });
        if (prevEditorAssignment.editorId.toString() !== editorId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn không phải biên tập viên được chỉ định cho bài báo này!' });
        } else if (reviewerAssignments.length >= 3) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bài báo đã có đủ thẩm định viên!' });
        }
        else if (prevReviewerAssignment.length > 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Thẩm định viên này đã được chỉ định từ trước!' });
        }
        else {
            const submission = await Submission.findById(submissionId);

            const reviewerAssignment = new ReviewerAssignment({
                submissionId: submissionId,
                reviewerId: reviewerId,
                editorId: editorId,
                dueDate: Date.parse(dueDate),
                message: message,
                isAccepted: false,
            });
            await reviewerAssignment.save();

            // add ref to editor assignment
            const editorAssignment = await EditorAssignment.findOne({ submissionId: submissionId });
            editorAssignment.reviewerAssignmentId.push(reviewerAssignment._id);
            await editorAssignment.save();

            // add submission logif has full reviewer (3/3)
            if (reviewerAssignments.length == 2) {
                const log = {
                    event: logTemplates.submissionHasFullReviewer(),
                    createdAt: new Date()
                };
                submission.submissionLogs.push(log);
            }
            await submission.save();

            // push noti
            const noti = new Notification({
                senderId: editorId,
                senderAvatar: req.user.avatar,
                receiverId: reviewerId,
                type: NOTIFICATION_TYPE.EDITOR_TO_REVIEWER,
                title: 'Yêu cầu thẩm định',
                content: 'Biên tập viên ' + req.user.fullname + ' đã chỉ định bạn thẩm định một bài báo.',
                link: '/dashboard/reviewer/assignment/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.OK).json({
                message: 'Chỉ định thẩm định viên thành công!'
            });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};


exports.getEditorAssignmentBySubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const editorAssignment = await EditorAssignment.findOne({ submissionId: submissionId })
            .populate('editorId', 'firstname lastname')
            .populate('chiefEditorId', 'firstname lastname')
            .populate({
                path: 'reviewerAssignmentId',
                select: 'reviewerId reviewerSubmissionId',
                populate: [
                    { path: 'reviewerId', select: 'firstname lastname' },
                    {
                        path: 'reviewerSubmissionId',
                        populate: { path: 'reviewerDecisionId', select: '-_id' }
                    },
                ]
            })
            .populate({
                path: 'editorSubmissionId',
                select: '-updatedAt',
                populate: { path: 'editorDecisionId' }
            })
            .exec();
        res.status(StatusCodes.OK).json({
            editorAssignment: editorAssignment
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getMyEditorAssignments = async (req, res) => {
    const page = +req.query.page || 1;
    const editorId = req.user.userId;
    try {
        const total = await EditorAssignment.countDocuments({ editorId: editorId });
        const editorAssignments = await EditorAssignment
            .find({ editorId: editorId })
            .populate('editorId', 'firstname lastname')
            .populate('chiefEditorId', 'firstname lastname')
            .populate({
                path: 'submissionId',
                select: 'title stageId authorId',
                populate: [
                    { path: 'stageId', select: 'name value -_id' },
                    { path: 'authorId', select: 'firstname lastname' }
                ]
            })
            .populate({
                path: 'reviewerAssignmentId',
                select: 'reviewerId reviewerSubmissionId',
                populate: [
                    { path: 'reviewerId', select: 'firstname lastname' },
                    {
                        path: 'reviewerSubmissionId',
                        select: 'reviewerDecisionId',
                        populate: { path: 'reviewerDecisionId', select: '-_id' }
                    },
                ]
            })
            .populate('authorAssignmentId', 'authorRevisionId -_id')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ _id: -1 })
            .exec();
        res.status(StatusCodes.OK).json({
            editorAssignments: editorAssignments,
            total: total,
            currentPage: page
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getMyReviewerAssignments = async (req, res) => {
    const page = +req.query.page || 1;
    const reviewerId = req.user.userId;
    try {
        const total = await ReviewerAssignment.countDocuments({ reviewerId: reviewerId });
        const reviewerAssignments = await ReviewerAssignment
            .find({ reviewerId: reviewerId })
            .populate({ path: 'reviewerId', select: 'firstname lastname' })
            .populate({ path: 'editorId', select: 'firstname lastname' })
            .populate({
                path: 'submissionId',
                select: 'title stageId authorId',
                populate: [
                    { path: 'stageId', select: 'name value -_id' },
                    { path: 'authorId', select: 'firstname lastname' }
                ]
            })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ _id: -1 })
            .exec();
        res.status(StatusCodes.OK).json({
            reviewerAssignments: reviewerAssignments,
            total: total,
            currentPage: page
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getMyReviewerAssignmentBySubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    const reviewerId = req.user.userId;
    try {
        const reviewerAssignment = await ReviewerAssignment
            .findOne({
                reviewerId: reviewerId,
                submissionId: submissionId
            })
            .populate({ path: 'reviewerId', select: 'firstname lastname' })
            .populate({ path: 'editorId', select: 'firstname lastname' })
            .populate({
                path: 'submissionId',
                select: 'title stageId authorId',
                populate: [
                    { path: 'stageId', select: 'name value -_id' },
                    { path: 'authorId', select: 'firstname lastname' }
                ]
            })
            .populate({
                path: 'reviewerSubmissionId',
                select: '-_id -updatedAt',
                populate: { path: 'reviewerDecisionId' }
            })
            .exec();
        res.status(StatusCodes.OK).json({
            reviewerAssignment: reviewerAssignment
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.createReviewerSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    let reviewerDecisionId = req.body.reviewerDecisionId;
    const content = req.body.content;
    const reviewerId = req.user.userId; // nguoi tao

    if (reviewerDecisionId === "") {
        const decision = await ReviewerDecision.find().limit(1);
        reviewerDecisionId = decision[0]._id;
    }

    try {
        const reviewerAssignment = await ReviewerAssignment.findOne({
            submissionId: submissionId,
            reviewerId: reviewerId
        });
        const editorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            reviewerAssignmentId: reviewerAssignment._id
        });
        const authorAssignment = await AuthorAssignment.exists({
            submissionId: submissionId,
            editorId: reviewerAssignment.editorId
        });

        if (reviewerAssignment.reviewerSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã nộp ý kiến trước đó!' });
        } else if (editorAssignment.editorSubmissionId || authorAssignment) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã đóng quá trình thẩm định!' });
        } else {
            const reviewerSubmission = new ReviewerSubmission({
                content: content,
                reviewerDecisionId: reviewerDecisionId
            });
            const rs = await reviewerSubmission.save();

            reviewerAssignment.reviewerSubmissionId = rs._id;
            await reviewerAssignment.save();

            // add submission log
            const submission = await Submission.findById(submissionId);
            const reviewer = await User.findById(reviewerId).select('firstname lastname');
            const log = {
                event: logTemplates.reviewerCreateReview(reviewer.lastname + ' ' + reviewer.firstname),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            await submission.save();

            // push noti
            const noti = new Notification({
                senderId: reviewerId,
                senderAvatar: req.user.avatar,
                receiverId: reviewerAssignment.editorId,
                type: NOTIFICATION_TYPE.REVIEWER_TO_EDITOR,
                title: 'Kết quả thẩm định',
                content: 'Thẩm định viên ' + req.user.fullname + ' đã nộp ý kiến thẩm định bài báo.',
                link: '/dashboard/editor/assignment/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.CREATED).json({
                message: 'Gửi ý kiến thẩm định thành công!'
            });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.editReviewerSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    const content = req.body.content;
    const reviewerDecisionId = req.body.reviewerDecisionId;
    const reviewerId = req.user.userId; // nguoi tao
    try {
        const reviewerAssignment = await ReviewerAssignment.findOne({
            submissionId: submissionId,
            reviewerId: reviewerId
        });
        const editorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            reviewerAssignmentId: reviewerAssignment._id
        });
        const authorAssignment = await AuthorAssignment.exists({
            submissionId: submissionId,
            editorId: reviewerAssignment.editorId
        });

        if (!reviewerAssignment.reviewerSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Không tìm thấy ý kiến thẩm định nào của bạn cho bài báo này!' });
        } else if (editorAssignment.editorSubmissionId || authorAssignment) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã đóng quá trình thẩm định!' });
        } else {
            const reviewerSubmission = await ReviewerSubmission.findById(reviewerAssignment.reviewerSubmissionId);
            if (reviewerSubmission.isAccepted) {
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã tiếp nhận ý kiến thẩm định của bạn trước đó!' });
            } else {
                reviewerSubmission.content = content;
                reviewerSubmission.reviewerDecisionId = reviewerDecisionId;
                await reviewerSubmission.save();
                res.status(StatusCodes.OK).json({
                    message: 'Chỉnh sửa ý kiến thẩm định thành công!',
                    // reviewerSubmission: rs
                });
            }
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.createEditorSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    let editorDecisionId = req.body.editorDecisionId;
    const content = req.body.content;
    const editorId = req.user.userId; // nguoi tao

    if (editorDecisionId === "") {
        const decision = await EditorDecision.find().limit(1);
        editorDecisionId = decision[0]._id;
    }

    try {
        const ceSubmission = await ChiefEditorSubmission.exists({
            submissionId: submissionId
        });
        const editorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            editorId: editorId
        });

        if (ceSubmission) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã đóng quá trình thẩm định cho bài báo này!' });
        } else if (editorAssignment.editorSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã nộp ý kiến thẩm định trước đó!' });
        } else {
            const editorSubmission = new EditorSubmission({
                content: content,
                editorDecisionId: editorDecisionId
            });
            const rs = await editorSubmission.save();

            editorAssignment.editorSubmissionId = rs._id;
            await editorAssignment.save();

            // add submission log
            const submission = await Submission.findById(submissionId);
            const log = {
                event: logTemplates.editorSubmitReview(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            await submission.save();

            // push noti
            const noti = new Notification({
                senderId: editorId,
                senderAvatar: req.user.avatar,
                receiverId: editorAssignment.chiefEditorId,
                type: NOTIFICATION_TYPE.EDITOR_TO_CHIEF_EDITOR,
                title: 'Kết quả thẩm định',
                content: 'Biên tập viên ' + req.user.fullname + ' đã nộp ý kiến thẩm định bài báo.',
                link: '/dashboard/submission/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.CREATED).json({
                message: 'Gửi ý kiến thẩm định thành công!'
            });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.editEditorSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    const content = req.body.content;
    const editorDecisionId = req.body.editorDecisionId;
    const editorId = req.user.userId; // nguoi tao
    try {
        const ceSubmission = await ChiefEditorSubmission.exists({
            submissionId: submissionId
        });
        const editorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            editorId: editorId
        });

        if (ceSubmission) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã đóng quá trình thẩm định cho bài báo này!' });
        } else if (!editorAssignment.editorSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Không tìm thấy ý kiến thẩm định nào của bạn cho bài báo này!' });
        } else {
            const editorSubmission = await EditorSubmission.findById(editorAssignment.editorSubmissionId);
            if (editorSubmission.isAccepted) {
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Tổng biên tập viên đã tiếp nhận ý kiến thẩm định của bạn trước đó!' });
            } else {
                editorSubmission.content = content;
                editorSubmission.editorDecisionId = editorDecisionId;
                await editorSubmission.save();
                res.status(StatusCodes.OK).json({
                    message: 'Chỉnh sửa ý kiến thẩm định thành công!',
                });
            }
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.requestSubmissionRevision = async (req, res) => {
    const submissionId = req.params.submissionId;
    const editorId = req.user.userId; // assigner
    const dueDate = req.body.dueDate;
    const message = req.body.message;
    try {
        const prevEditorAssignment = await EditorAssignment.findOne({ submissionId: submissionId });
        const prevAuthorAssignment = await AuthorAssignment.exists({ submissionId: submissionId });
        if (prevEditorAssignment.editorId.toString() !== editorId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn không phải biên tập viên được chỉ định cho bài báo này!' });
        }
        else if (prevAuthorAssignment) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã yêu cầu tác giả chỉnh sửa bài báo trước đó!' });
        } else {
            const submission = await Submission.findById(submissionId);
            const authorId = submission.authorId; // assignee

            const authorAssignment = new AuthorAssignment({
                submissionId: submission._id,
                authorId: authorId,
                editorId: editorId,
                dueDate: Date.parse(dueDate),
                message: message
            });
            await authorAssignment.save();

            // add ref to editor assignment
            prevEditorAssignment.authorAssignmentId = authorAssignment._id;
            await prevEditorAssignment.save();

            // add submission log
            const log = {
                event: logTemplates.editorRequestAuthorRevision(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            await submission.save();

            // push noti
            const noti = new Notification({
                senderId: editorId,
                senderAvatar: req.user.avatar,
                receiverId: authorId,
                type: NOTIFICATION_TYPE.EDITOR_TO_AUTHOR,
                title: 'Yêu cầu chỉnh sửa',
                content: 'Biên tập viên ' + req.user.fullname + ' đã yêu cầu bạn chỉnh sửa bài báo.',
                link: '/dashboard/submission/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.OK).json({
                message: 'Yêu cầu tác giả chỉnh sửa bài báo thành công!',
            });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getAuthorAssignmentBySubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    const userId = req.user.userId;
    const permissionLevel = req.user.role.permissionLevel;

    try {
        let authorAssignment = null;
        if (permissionLevel === USER_ROLES.AUTHOR.permissionLevel) {
            authorAssignment = await AuthorAssignment
                .findOne({
                    submissionId: submissionId,
                    authorId: userId
                })
                .populate('authorRevisionId')
                .populate('editorId', 'firstname lastname')
                .populate('authorId', 'firstname lastname')
                .exec();
        } else {
            authorAssignment = await AuthorAssignment
                .findOne({
                    submissionId: submissionId,
                    editorId: userId
                })
                .populate('authorRevisionId')
                .populate('editorId', 'firstname lastname')
                .populate('authorId', 'firstname lastname')
                .exec();;
        }

        res.status(StatusCodes.OK).json({
            authorAssignment: authorAssignment
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.authorSubmitRevision = async (req, res) => {
    const submissionId = req.params.submissionId;
    const authorId = req.user.userId;
    let categoryId = req.body.categoryId;
    const title = req.body.title;
    const abstract = req.body.abstract;

    try {
        const submission = await Submission.findOne({
            _id: submissionId,
            authorId: authorId
        });

        const authorAssignment = await AuthorAssignment.findOne({
            submissionId: submissionId,
            authorId: authorId
        });

        if (categoryId === "") {
            categoryId = submission.categoryId.toString();
        }

        if (!submission || !authorAssignment) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn không phải tác giả của bài báo này!' });
        } else if (req.error) { // in file-service upload error.
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

            // create author revision
            const authorRevision = new AuthorRevision();
            const newAuthorRevision = await authorRevision.save();
            authorAssignment.authorRevisionId = newAuthorRevision._id;
            await authorAssignment.save();

            // update logs
            const log = {
                event: logTemplates.authorSubmitRevision(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            const updatedSubmission = await submission.save();

            // push noti
            const noti = new Notification({
                senderId: authorId,
                senderAvatar: req.user.avatar,
                receiverId: authorAssignment.editorId,
                type: NOTIFICATION_TYPE.AUTHOR_TO_EDITOR,
                title: 'Yêu cầu chỉnh sửa',
                content: 'Tác giả ' + req.user.fullname + ' đã nộp bản chỉnh sửa bài báo.',
                link: '/dashboard/editor/assignment/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.OK).json({ submission: updatedSubmission });
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.acceptSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    const content = req.body.content;
    const chiefEditorId = req.user.userId;

    try {
        const prevCeSubmission = await ChiefEditorSubmission.exists({
            submissionId: submissionId,
            chiefEditorId: chiefEditorId
        });
        if (prevCeSubmission) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã đưa ra quyết định với bài báo này trước đó!' });
        } else {
            const submission = await Submission.findById(submissionId);

            // create chief editor submission
            const ceDecision = await ChiefEditorDecision.findOne(CHIEF_EDITOR_DECISION.ACCEPT_SUBMISSION);
            console.log(ceDecision);
            const ceSubmission = new ChiefEditorSubmission({
                submissionId: submissionId,
                chiefEditorId: chiefEditorId,
                content: content,
                chiefEditorDecisionId: ceDecision._id
            });
            await ceSubmission.save();

            // sendEmail to Author

            // update submission stage to PUBLISHED
            const publishedStage = await Stage.findOne(STAGE.PUBLISHED);
            submission.stageId = publishedStage._id;

            // add submission log
            const log = {
                event: logTemplates.chiefEditorAcceptSubmission(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            await submission.save();

            // publish Article;
            const article = new Article({
                submissionId: submissionId
            });
            await article.save();

            // push noti
            const noti = new Notification({
                senderId: chiefEditorId,
                senderAvatar: req.user.avatar,
                receiverId: submission.authorId,
                type: NOTIFICATION_TYPE.CHIEF_EDITOR_TO_AUTHOR,
                title: 'Kết quả thẩm định bài báo',
                content: 'Bài báo #' + submission._id + ' đã được chấp nhận xuất bản.',
                link: '/dashboard/submission/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.OK).json({
                message: 'Bài báo đã được chấp nhận xuất bản!'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.declineSubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    const content = req.body.content;
    const chiefEditorId = req.user.userId;

    try {
        const prevCeSubmission = await ChiefEditorSubmission.exists({
            submissionId: submissionId,
            chiefEditorId: chiefEditorId
        });
        if (prevCeSubmission) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã đưa ra quyết định với bài báo này trước đó!' });
        } else {
            const submission = await Submission.findById(submissionId);

            // create chief editor submission
            const ceDecision = await ChiefEditorDecision.findOne(CHIEF_EDITOR_DECISION.DECLINE_SUBMISSION);
            const ceSubmission = new ChiefEditorSubmission({
                submissionId: submissionId,
                chiefEditorId: chiefEditorId,
                content: content,
                chiefEditorDecisionId: ceDecision._id
            });
            await ceSubmission.save();

            // sendEmail to Author

            // add submission log
            const log = {
                event: logTemplates.chiefEditorDeclineSubmission(),
                createdAt: new Date()
            };
            submission.submissionLogs.push(log);
            await submission.save();

            // push noti
            const noti = new Notification({
                senderId: chiefEditorId,
                senderAvatar: req.user.avatar,
                receiverId: submission.authorId,
                type: NOTIFICATION_TYPE.CHIEF_EDITOR_TO_AUTHOR,
                title: 'Kết quả thẩm định bài báo',
                content: 'Bài báo #' + submission._id + ' đã bị từ chối xuất bản.',
                link: '/dashboard/submission/' + submissionId
            });
            await noti.save();

            res.status(StatusCodes.OK).json({
                message: 'Từ chối bài báo thành công!'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getCESubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const chiefEditorSubmission = await ChiefEditorSubmission
            .findOne({
                submissionId: submissionId
            })
            .populate('chiefEditorDecisionId', '-_id')
            .populate('chiefEditorId', 'firstname lastname')
            .exec();
        res.status(StatusCodes.OK).json({
            chiefEditorSubmission: chiefEditorSubmission
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};


