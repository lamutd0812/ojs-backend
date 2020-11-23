const mongoose = require('mongoose');

const authorAssignmentSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Submission'
    },
    authorId: { // Assignee
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    editorId: { // Assigner
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dueDate: {
        type: Date,
        required: true
    },
    message: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuthorAssignment', authorAssignmentSchema, 'author_assignments');