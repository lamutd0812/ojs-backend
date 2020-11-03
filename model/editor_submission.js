const mongoose = require('mongoose');

const editorSubmissionSchema = new mongoose.Schema({
    content: {
        type: String
    },
    editorDecisionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EditorDecision',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EditorSubmission', editorSubmissionSchema, 'editor_submissions')