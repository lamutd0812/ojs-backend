const mongoose = require('mongoose');

const reviewerAssignmentSchema = new mongoose.Schema({
    editorAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'EditorAssignment'
    },
    reviewerId: {
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
    reviewerSubmissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'ReviewerSubmission'
    },
    isAccepted: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReviewerAssignment', reviewerAssignmentSchema, 'reviewer_assignments');