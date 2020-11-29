const mongoose = require('mongoose');

const chiefEditorSubmissionSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
    chiefEditorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String
    },
    chiefEditorDecisionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChiefEditorDecision',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChiefEditorSubmission', chiefEditorSubmissionSchema, 'chief_editor_submissions')