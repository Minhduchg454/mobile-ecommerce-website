const mongoose = require('mongoose');
const baseUserSchema = require('./user.schema');

const adminSchema = new mongoose.Schema({
    ...baseUserSchema.obj, // dùng `.obj` để lấy lại định nghĩa các trường
}, {
    timestamps: true // bạn có thể giữ timestamps nếu cần
});

module.exports = mongoose.model('Admin', adminSchema);
