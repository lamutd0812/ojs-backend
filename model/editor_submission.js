const mongoose = require('mongoose');

const editorSubmissionSchema = new mongoose.Schema({
    content: {
        type: String
    },
    attachmentFile: {
        type: String,
    },
    attachmentUrl: {
        type: String,
    },
    editorDecisionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EditorDecision',
        required: true
    },
    isAccepted: {
        // when chief editor set isAccepted = true, editor can't edit his EditorSubmission.
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EditorSubmission', editorSubmissionSchema, 'editor_submissions')