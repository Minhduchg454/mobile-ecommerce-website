const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Message Schema
const messageSchema = new Schema({
  messageNumber: {
    type: Number,
    required: true,
  },
  messageSender: {
    type: String,
    required: true,
  },
  messageContent: {
    type: String,
    required: true,
  },
  // You might want to add a timestamp for messages
  messageCreatedAt: {
    type: Date,
    default: Date.now,
  },
  chatId: {
    // KHÓA NGOẠI: Thêm chatId để liên kết với Chat
    type: Schema.Types.ObjectId, // Loại ObjectId cho khóa ngoại
    ref: "Chat", // Tham chiếu đến model 'Chat'
    required: true, // Bắt buộc mỗi tin nhắn phải thuộc về một chat
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
