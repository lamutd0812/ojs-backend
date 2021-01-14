const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // senderAvatar: {
    //     type: String,
    //     required: true
    // },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true 
    },
    content: {
        type: String,
        required: true 
    },
    link: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);