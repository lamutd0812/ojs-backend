const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
    email: {
        type: String
    },
    firstname: {
        type: String
    },
    lastName: {
        type: String
    },
    affiliation: {
        type: String
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    }
});

module.exports = mongoose.model('Contributor', contributorSchema);