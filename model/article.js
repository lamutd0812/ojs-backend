const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    publishedDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    viewCount: {
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