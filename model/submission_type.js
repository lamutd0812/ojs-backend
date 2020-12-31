const mongoose = require('mongoose');

const submissionTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    }
});

module.exports = mongoose.model('SubmissionType', submissionTypeSchema, 'submission_types');