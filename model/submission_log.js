const mongoose = require('mongoose');

const submissionLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('SubmissionLog', submissionLogSchema, 'submission_logs');