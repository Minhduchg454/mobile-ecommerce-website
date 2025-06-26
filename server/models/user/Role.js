// models/Role.js
const mongoose = require('mongoose');

// Định nghĩa schema cho vai trò người dùng (User Role)
const roleSchema = new mongoose.Schema({
    roleName: {
        type: String, // Tên vai trò (ví dụ: 'admin', 'customer')
        required: true
    }
});

module.exports = mongoose.model('Role', roleSchema);