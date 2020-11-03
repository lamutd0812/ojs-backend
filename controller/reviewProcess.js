const User = require('../model/user');
const UserRole = require('../model/user_role');
const Submission = require('../model/submission');
const Stage = require('../model/stage');
const EditorAssignment = require('../model/editor_assignment');
const { USER_ROLES, STAGE, SUBMISSION_STATUS } = require('../config/constant');

exports.getAllEditors = async (req, res) => {
    try {
        const editorRole = await UserRole.findOne(USER_ROLES.EDITOR);
        const editors = await User.find({ role: editorRole._id });
        res.status(200).json({ editors: editors });
    } catch (err) {
        res.status(500).json({
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
        const submission = await Submission.findById(submissionId);
        const lastEditorAssignment = await EditorAssignment.findOne({
            submissionId: submissionId,
            editorId: editorId
        });
        if (lastEditorAssignment) {
            res.status(403).json({ error: 'Biên tập viên đã được chỉ định cho bái báo này!' });
        }
        else {
            const editorAssignment = new EditorAssignment({
                submissionId: submissionId,
                editorId: editorId,
                dueDate: Date.parse(dueDate),
                message: message,
                isAccepted: false
            });
            await editorAssignment.save();

            const reviewStage = await Stage.findOne(STAGE.REVIEW);
            submission.submissionStatus.stageId = reviewStage._id;
            submission.submissionStatus.status = SUBMISSION_STATUS.ASSIGN_EDITOR_SUCCESS;

            await submission.save();
            // const savedSunmission = await submission.save();
            res.status(200).json({
                message: 'Chỉ định biên tập viên thành công!',
                // submission: savedSunmission
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};