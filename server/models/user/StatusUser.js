// models/StatusUser.js
const mongoose = require('mongoose');

// Định nghĩa schema cho trạng thái người dùng
const statusUserSchema = new mongoose.Schema({
    statusUserName: {
        type: String, // Tên trạng thái (ví dụ: 'active', 'inactive', ...)
        required: true
    }
});

module.exports = mongoose.model('StatusUser', statusUserSchema);