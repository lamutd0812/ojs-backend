const mongoose = require('mongoose');

const authorRevisionSchema = new mongoose.Schema({
    isAccepted: {
        // when chief editor set isAccepted = true, author can't edit his AuthorRevision.
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuthorRevision', authorRevisionSchema, 'author_revisions')