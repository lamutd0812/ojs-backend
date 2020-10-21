const mongoose = require('mongoose');

const reviewAssignmentSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
    requestedDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    message: {
        type: String
    }
});

module.exports = mongoose.model('ReviewAssignment', reviewAssignmentSchema, 'review_assignments');