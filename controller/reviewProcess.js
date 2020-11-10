const User = require('../model/user');
const UserRole = require('../model/user_role');
const Submission = require('../model/submission');
const Stage = require('../model/stage');
const EditorAssignment = require('../model/editor_assignment');
const SubmissionLog = require('../model/submission_log');
const { StatusCodes } = require('http-status-codes');
const logTemplates = require('../utils/log-templates');
const { USER_ROLES, STAGE, SUBMISSION_STATUS } = require('../config/constant');
// const { updateObject, generateRandomString } = require('../utils/utility');

exports.getAllEditors = async (req, res) => {
    try {
        const editorRole = await UserRole.findOne(USER_ROLES.EDITOR);
        const editors = await User.find({ role: editorRole._id });
        res.status(StatusCodes.OK).json({ editors: editors });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
}

exports.assignEditor = async (req, res) => {
    const submissionId = req.body.submissionId;
    const editorId = req.body.editorId;
    const dueDate = req.body.dueDate;
    const message = req.body.message;
    try {
        const prevEditorAssignment = await EditorAssignment.findOne({ submissionId: submissionId });
        if (prevEditorAssignment) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Biên tập viên đã được chỉ định cho bái báo này!' });
        }
        else {
            const submission = await Submission.findById(submissionId);
            const editorAssignment = new EditorAssignment({
                submissionId: submissionId,
                editorId: editorId,
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
                event: logTemplates.chiefEditorAssignEditor(editor.firstname + ' ' + editor.lastname),
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
    }
};

exports.getEditorAssignmentBySubmission = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const editorAssignment = await EditorAssignment.findOne({ submissionId: submissionId })
            .populate('editorId', 'firstname lastname').exec();
        res.status(StatusCodes.OK).json({
            editorAssignment: editorAssignment
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getMyEditorAssignments = async (req, res) => {
    const editorId = req.user.userId;
    try {
        const editorAssignments = await EditorAssignment
            .find({ editorId: editorId })
            .populate({
                path: 'submissionId',
                select: 'title submissionStatus',
                populate: { path: 'submissionStatus.stageId', select: 'name value -_id' }
            }).exec();
        res.status(StatusCodes.OK).json({
            editorAssignments: editorAssignments
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
}