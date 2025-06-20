// models/StatusUser.js
const mongoose = require('mongoose');

const statusUserSchema = new mongoose.Schema({
    statusUserId: {
        type: Number, // NumberInt trong biểu đồ
        required: true,
        unique: true,
        index: true // Tối ưu hóa việc tìm kiếm
    },
    statusUserName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('StatusUser', statusUserSchema);