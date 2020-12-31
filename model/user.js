const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    affiliation: {
        type: String,
        required: true
    },
    biography: {
        type: String
    },
    avatar: {
        type: String
    },
    isVerified: {
        type: Boolean
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserRole'
    },
    preferenceCategoryId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);