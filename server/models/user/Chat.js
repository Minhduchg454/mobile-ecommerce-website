// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        required: true,
        trim: true
    },
    // Mối quan hệ với User (Chat "Có đoạn chat" User)
    // Một chat có thể có nhiều người dùng tham gia
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Mối quan hệ với Message (Chat "Bao gồm" Message) - sẽ được xử lý từ phía Message
    // Hoặc nếu muốn nhúng tin nhắn trực tiếp vào chat, có thể làm như sau:
    // messages: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Message'
    // }]
    // Tuy nhiên, với số lượng tin nhắn lớn, thường tham chiếu là tốt hơn.
    // Hoặc nhúng một phần (vd: 5 tin nhắn gần nhất) và tham chiếu phần còn lại.
    // Trong trường hợp này, tôi sẽ để Message tham chiếu ngược lại Chat.
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);