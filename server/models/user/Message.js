// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    numberMessage: { // NumberInt trong biểu đồ
        type: Number,
        required: true,
        unique: true, // Nếu mỗi tin nhắn có số duy nhất trên toàn hệ thống
        index: true
    },
    role: { // Vai trò của người gửi tin nhắn (ví dụ: 'user', 'admin'), Không bắt buộc nếu đoạn chat có nhiều hơn  hai người thì có thể nhầm lẫn user
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // Mối quan hệ với Chat (Message thuộc về một Chat)
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true // Mỗi tin nhắn phải thuộc về một cuộc trò chuyện
    },
    // Người gửi tin nhắn (nếu muốn biết ai là người gửi cụ thể)
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Mỗi tin nhắn phải có người gửi
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);