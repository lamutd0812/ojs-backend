const mongoose = require('mongoose');

const editorAssignmentSchema = new mongoose.Schema({
    editorId: {
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
        ref: 'EditorSubmission'
    },
    isAccepted: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EditorAssignment', editorAssignmentSchema, 'editor_assignments');