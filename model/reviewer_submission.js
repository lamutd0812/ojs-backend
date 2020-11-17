const mongoose = require('mongoose');

const reviewerSubmissionSchema = new mongoose.Schema({
    content: {
        type: String
    },
    attachmentFile: {
        type: String
    },
    reviewerDecisionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewerDecision',
        required: true
    },
    isAccepted: {
        // when editor set isAccepted = true, reviewers can't edit their ReviewerSubmission. 
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReviewerSubmission', reviewerSubmissionSchema, 'reviewer_submissions')