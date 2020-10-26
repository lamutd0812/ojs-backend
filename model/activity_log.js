const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    timeStone: {
        type: Date,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

module.exports = mongoose.model('ActivityLog', activityLogSchema, 'activity_logs');