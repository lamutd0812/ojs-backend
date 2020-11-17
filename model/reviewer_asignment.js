const mongoose = require('mongoose');

const reviewerAssignmentSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
    reviewerId: { // Assignee
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    editorId: { // Assigner
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReviewerAssignment', reviewerAssignmentSchema, 'reviewer_assignments');