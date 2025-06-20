const mongoose = require('mongoose');
const baseUserSchema = require('./user.schema');

const customerSchema = new mongoose.Schema({
    ...baseUserSchema.obj, // dùng `.obj` để lấy lại định nghĩa các trường

    shoppingCart: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của ShoppingCart
        ref: 'ShoppingCart',
        unique: true, // Đảm bảo mỗi Customer chỉ có một ShoppingCart và ngược lại
        required: false // Giỏ hàng có thể được tạo sau
    }
}, {
    timestamps: true // bạn có thể giữ timestamps nếu cần
});

module.exports = mongoose.model('Customer', customerSchema);
