const mongoose = require('mongoose');

const reviewerDecisionSchema = new mongoose.Schema({
    decisionName: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('ReviewerDecision', reviewerDecisionSchema, 'reviewer_decisions')