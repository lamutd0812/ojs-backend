const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        // required: true
    },
    abstract: {
        type: String,
        required: true
    },
    attachmentFile: {
        type: String,
        required: true
    },
    attachmentUrl: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    submissionStatus: {
        status: {
            type: String,
            required: true
        },
        stageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Stage'
        }
    },
    submissionLogs: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SubmissionLog'
    }],
    editorAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EditorAssignment'
    },
    reviewerAssignmentId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewerAssignment'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);