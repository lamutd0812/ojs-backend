const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    permissionLevel: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('UserRole', userRoleSchema,'user_roles');