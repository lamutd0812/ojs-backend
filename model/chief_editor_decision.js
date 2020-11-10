const mongoose = require('mongoose');

const chiefEditorDecisionSchema = new mongoose.Schema({
    decisionName: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('ChiefEditorDecision', chiefEditorDecisionSchema, 'chief_editor_decisions')