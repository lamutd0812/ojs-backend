const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    publishedDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    downloaded: {
        type: Number,
        required: true,
        default: 0
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
});

module.exports = mongoose.model('Article', articleSchema);