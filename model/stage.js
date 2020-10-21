const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    value: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Stage', stageSchema);