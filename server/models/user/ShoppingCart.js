// models/ShoppingCart.js
const mongoose = require('mongoose');

// Định nghĩa schema cho giỏ hàng của khách hàng
const shoppingCartSchema = new mongoose.Schema({
    totalPrice: {
        type: Number, // Tổng giá trị giỏ hàng
        required: true,
        default: 0
    },
    // Có thể bổ sung userId nếu muốn liên kết trực tiếp với Customer/User
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);