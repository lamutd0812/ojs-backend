const mongoose = require('mongoose');

const reviewerSubmissionSchema = new mongoose.Schema({
    content: {
        type: String
    },
    reviewerDecisionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewerDecision',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReviewerSubmission', reviewerSubmissionSchema, 'reviewer_submissions')