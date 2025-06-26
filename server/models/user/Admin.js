const mongoose = require('mongoose');
const baseUserSchema = require('./user.schema');

// Định nghĩa schema cho Admin, kế thừa từ user.schema.js
const adminSchema = new mongoose.Schema({
    ...baseUserSchema.obj, // Kế thừa toàn bộ trường của User
    // Có thể bổ sung trường riêng cho Admin ở đây nếu cần
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Admin', adminSchema);
