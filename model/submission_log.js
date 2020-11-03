const mongoose = require('mongoose');

const submissionLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('SubmissionLog', submissionLogSchema, 'submission_logs');