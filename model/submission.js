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
    editorId: {
        type: mongoose.Schema.Types.ObjectId,
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);