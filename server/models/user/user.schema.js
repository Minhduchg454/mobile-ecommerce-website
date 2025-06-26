const mongoose = require('mongoose');

// Định nghĩa schema chung cho User, Customer, Admin
const userSchema = new mongoose.Schema({
    firstName: {
        type: String, // Họ
        required: true,
        trim: true
    },
    lastName: {
        type: String, // Tên
        required: true,
        trim: true
    },
    email: {
        type: String, // Email duy nhất
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    avatar: {
        type: String, // Đường dẫn ảnh đại diện
    },
    mobile: {
        type: String, // Số điện thoại duy nhất
        unique: true,
        required: true,
        trim: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến Role
        ref: 'Role',
        required: true
    },
    userName: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến Account
        ref: 'Account',
        unique: true,
        required: true
    },
    statusUserId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến StatusUser
        ref: 'StatusUser',
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = userSchema;
