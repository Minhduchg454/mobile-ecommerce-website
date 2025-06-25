// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        required: true,
        trim: true
    },
    // Nhieu nguoi co the tham gia vao mot chat nen dung mang
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);