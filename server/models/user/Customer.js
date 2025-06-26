const mongoose = require('mongoose');
const baseUserSchema = require('./user.schema');

// Định nghĩa schema cho Customer, kế thừa từ user.schema.js
const customerSchema = new mongoose.Schema({
    ...baseUserSchema.obj, // Kế thừa toàn bộ trường của User
    shoppingCart: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ShoppingCart
        ref: 'ShoppingCart',
        unique: true, // Mỗi Customer chỉ có một ShoppingCart
        required: false // Giỏ hàng có thể được tạo sau
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Customer', customerSchema);
