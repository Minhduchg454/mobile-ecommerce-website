// models/Account.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Để mã hóa mật khẩu

const accountSchema = new mongoose.Schema({
    userName: { // Tên trường thường là 'username' thay vì 'UserName'
        type: String, // NumberInt trong biểu đồ, nhưng thường username là String
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: { // Tên trường thường là 'password' thay vì 'Password'
        type: String,
        required: true
    }
});

// Middleware pre-save để hash mật khẩu trước khi lưu
accountSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Phương thức để so sánh mật khẩu
accountSchema.methods.isCorrectPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Account', accountSchema);