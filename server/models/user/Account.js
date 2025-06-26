// models/Account.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Dùng để mã hóa mật khẩu

// Định nghĩa schema cho tài khoản đăng nhập
const accountSchema = new mongoose.Schema({
    userName: { // Tên đăng nhập, duy nhất
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: { // Mật khẩu đã được hash
        type: String,
        required: true
    }
});

// Middleware: Tự động hash mật khẩu trước khi lưu vào DB
accountSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Phương thức kiểm tra mật khẩu nhập vào có đúng không
accountSchema.methods.isCorrectPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Account', accountSchema);