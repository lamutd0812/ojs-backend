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
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SubmissionType'
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    submissionLogs: [{
        _id: false,
        event: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true
        }
    }],
    stageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Stage'
    },
    contributors: [{
        _id: false,
        fullname: String,
        affiliation: String
    }],
    metadata: [{
        _id: false,
        url: String,
        filename: String
    }],
    magazineName: {
        type: String
    },
    DOI: {
        type: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);