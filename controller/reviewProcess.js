const User = require('../model/user');
const UserRole = require('../model/user_role');
const Submission = require('../model/submission');
const SubmissionLog = require('../model/submission_log');
const Stage = require('../model/stage');
const EditorAssignment = require('../model/editor_assignment');
const EditorSubmission = require('../model/editor_submission');
const EditorDecision = require('../model/editor_decision');
const ReviewerAssignment = require('../model/reviewer_asignment');
const ReviewerSubmission = require('../model/reviewer_submission');
const ReviewerDecision = require('../model/reviewer_decision');
const AuthorAssignment = require('../model/author_assignment');
const { StatusCodes } = require('http-status-codes');
const logTemplates = require('../utils/log-templates');
const { USER_ROLES, STAGE, SUBMISSION_STATUS, REVIEWER_DECISION } = require('../config/constant');

exports.getAllEditors = async (req, res) => {
    const submissionId = req.query.submissionId;
    try {
        let ids = [];
        // Not assign Editor if Editor is Submisison's Author
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
        // Not Assign Reviewer if Reviewer is Submisison's Author
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

            // update submission status
            const reviewStage = await Stage.findOne(STAGE.REVIEW);
            submission.submissionStatus.stageId = reviewStage._id;
            submission.submissionStatus.status = SUBMISSION_STATUS.ASSIGN_EDITOR_SUCCESS;

            // add submisison log
            const editor = await User.findById(editorId).select('firstname lastname');
            const log = new SubmissionLog({
                event: logTemplates.chiefEditorAssignEditor(editor.lastname + ' ' + editor.firstname),
                createdAt: new Date()
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);

            await submission.save();
            // const savedSunmission = await submission.save();
            res.status(StatusCodes.OK).json({
                message: 'Chỉ định biên tập viên thành công!',
                // submission: savedSunmission
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

            // update submission status
            const reviewStage = await Stage.findOne(STAGE.REVIEW);
            submission.submissionStatus.stageId = reviewStage._id;
            submission.submissionStatus.status = SUBMISSION_STATUS.ASSIGN_REVIEWER_SUCCESS;

            // add submisison log if has full reviewer (3/3)
            if (reviewerAssignments.length == 2) {
                const log = new SubmissionLog({
                    event: logTemplates.submissionHasFullReviewer(),
                    createdAt: new Date()
                });
                const newLog = await log.save();
                submission.submissionLogs.push(newLog._id);

            }
            await submission.save();
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

exports.getReviewerAssignmentsBySubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const reviewerAssignments = await ReviewerAssignment.find({ submissionId: submissionId })
            .populate('reviewerId', 'firstname lastname')
            .populate('editorId', 'firstname lastname')
            // .populate({
            //     path: 'submissionId',
            //     select: 'title submissionStatus authorId',
            //     populate: [
            //         { path: 'submissionStatus.stageId', select: 'name value -_id' },
            //         { path: 'authorId', select: 'firstname lastname' }
            //     ]
            // })
            .populate({
                path: 'reviewerSubmissionId',
                select: '-updatedAt',
                populate: { path: 'reviewerDecisionId' }
            })
            .exec();
        res.status(StatusCodes.OK).json({
            reviewerAssignments: reviewerAssignments
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getMyEditorAssignments = async (req, res) => {
    const editorId = req.user.userId;
    try {
        const editorAssignments = await EditorAssignment
            .find({ editorId: editorId })
            .populate('editorId', 'firstname lastname')
            .populate('chiefEditorId', 'firstname lastname')
            .populate({
                path: 'submissionId',
                select: 'title submissionStatus authorId',
                populate: [
                    { path: 'submissionStatus.stageId', select: 'name value -_id' },
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
            .exec();
        res.status(StatusCodes.OK).json({
            editorAssignments: editorAssignments
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getMyReviewerAssignments = async (req, res) => {
    const reviewerId = req.user.userId;
    try {
        const reviewerAssignments = await ReviewerAssignment
            .find({ reviewerId: reviewerId })
            .populate({ path: 'reviewerId', select: 'firstname lastname' })
            .populate({ path: 'editorId', select: 'firstname lastname' })
            .populate({
                path: 'submissionId',
                select: 'title submissionStatus authorId',
                populate: [
                    { path: 'submissionStatus.stageId', select: 'name value -_id' },
                    { path: 'authorId', select: 'firstname lastname' }
                ]
            }).exec();
        res.status(StatusCodes.OK).json({
            reviewerAssignments: reviewerAssignments
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
                select: 'title submissionStatus authorId',
                populate: [
                    { path: 'submissionStatus.stageId', select: 'name value -_id' },
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
        if (reviewerAssignment.reviewerSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã nộp ý kiến trước đó!' });
        } else {
            const reviewerSubmission = new ReviewerSubmission({
                content: content,
                reviewerDecisionId: reviewerDecisionId
            });
            const rs = await reviewerSubmission.save();

            reviewerAssignment.reviewerSubmissionId = rs._id;
            await reviewerAssignment.save();

            // add submisison log
            const submission = await Submission.findById(submissionId);
            const reviewer = await User.findById(reviewerId).select('firstname lastname');
            const log = new SubmissionLog({
                event: logTemplates.reviewerCreateReview(reviewer.lastname + ' ' + reviewer.firstname),
                createdAt: new Date()
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);
            await submission.save();

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
        if (!reviewerAssignment.reviewerSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Không tìm thấy ý kiến thẩm định nào của bạn cho bài báo này!' });
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
        const editorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            editorId: editorId
        });
        if (editorAssignment.editorSubmissionId) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Bạn đã nộp ý kiến trước đó!' });
        } else {
            const editorSubmission = new EditorSubmission({
                content: content,
                editorDecisionId: editorDecisionId
            });
            const rs = await editorSubmission.save();

            editorAssignment.editorSubmissionId = rs._id;
            await editorAssignment.save();

            // add submisison log
            const submission = await Submission.findById(submissionId);
            const editor = await User.findById(editorId).select('firstname lastname');
            const log = new SubmissionLog({
                event: logTemplates.editorSubmitReview(editor.lastname + ' ' + editor.firstname),
                createdAt: new Date()
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);
            await submission.save();

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
        const editorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            editorId: editorId
        });
        if (!editorAssignment.editorSubmissionId) {
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
        const prevAuthorAssignment = await AuthorAssignment.findOne({ submissionId: submissionId });
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

            // add submisison log
            const editor = await User.findById(editorId).select('firstname lastname');
            const log = new SubmissionLog({
                event: logTemplates.editorRequestAuthorRevision(editor.lastname + ' ' + editor.firstname),
                createdAt: new Date()
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);
            await submission.save();

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
            authorAssignment = await AuthorAssignment.findOne({
                submissionId: submissionId,
                authorId: userId
            })
            .populate('editorId', 'firstname lastname')
            .populate('authorId', 'firstname lastname')
            .exec();
        } else {
            authorAssignment = await AuthorAssignment.findOne({
                submissionId: submissionId,
                editorId: userId
            })
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
}


