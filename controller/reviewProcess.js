const User = require('../model/user');
const UserRole = require('../model/user_role');
const Submission = require('../model/submission');
const Stage = require('../model/stage');
const EditorAssignment = require('../model/editor_assignment');
const ReviewerAssignment = require('../model/reviewer_asignment');
const ReviewerSubmission = require('../model/reviewer_submission');
const SubmissionLog = require('../model/submission_log');
const { StatusCodes } = require('http-status-codes');
const logTemplates = require('../utils/log-templates');
const { USER_ROLES, STAGE, SUBMISSION_STATUS } = require('../config/constant');

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
        if (reviewerAssignments.length >= 3) {
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
                isAccepted: false
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

            // add submisison log
            const reviewer = await User.findById(reviewerId).select('firstname lastname');
            const log = new SubmissionLog({
                event: logTemplates.editorAssignReviewer(reviewer.lastname + ' ' + reviewer.firstname),
                createdAt: new Date()
            });
            const newLog = await log.save();
            submission.submissionLogs.push(newLog._id);

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
            .populate({ path: 'editorId', select: 'firstname lastname' })
            .populate({ path: 'chiefEditorId', select: 'firstname lastname' })
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
                select: 'reviewerId',
                populate: { path: 'reviewerId', select: 'firstname lastname' }
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
            }).exec();
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
    const content = req.body.content;
    const reviewerDecisionId = req.body.reviewerDecisionId;
    const reviewerId = req.user.userId;
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
            res.status(StatusCodes.CREATED).json({
                message: 'Gửi ý kiến thẩm định thành công!'
                // reviewerSubmission: rs
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
    const reviewerId = req.user.userId;
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
                res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã tiếp nhận ý kiến thẩm định trước đó!' });
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
