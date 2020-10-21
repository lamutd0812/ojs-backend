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
    profileImage: {
        type: String
    },
    isVerified: {
        type: Boolean
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserRole'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);