const mongoose = require('mongoose');
const { collection } = require('./user');

const submissionStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    stageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Stage'
    }
});

module.exports = mongoose.model('SubmissionStatus', submissionStatusSchema, 'submission_statuses');