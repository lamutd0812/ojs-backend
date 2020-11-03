const mongoose = require('mongoose');

const editorDecisionSchema = new mongoose.Schema({
    decisionName: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('EditorDecision', editorDecisionSchema, 'editor_decisions')