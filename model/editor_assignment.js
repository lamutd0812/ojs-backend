const mongoose = require('mongoose');

const editorAssignmentSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
    editorId: { // Assignee
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    chiefEditorId: { // Assigner
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dueDate: {
        type: Date,
        required: true
    },
    message: {
        type: String
    },
    editorSubmissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'EditorSubmission',
        default: null
    },
    reviewerAssignmentId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'ReviewerAssignment'
    }],
    authorAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'AuthorAssignment'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EditorAssignment', editorAssignmentSchema, 'editor_assignments');