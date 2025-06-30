const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chatSchema = new Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true // Assuming chatId is a unique identifier
    },
    chatName: {
        type: String,
        required: true
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;