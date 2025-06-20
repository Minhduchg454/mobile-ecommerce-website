// models/ShoppingCart.js
const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema({
    cartId: { // Theo biểu đồ
        type: Number, // NumberInt
        required: true,
        unique: true, // Đảm bảo mỗi cartId là duy nhất
        index: true
    },
    totalPrice: {
        type: Number, // NumberFloat
        required: true,
        default: 0
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);