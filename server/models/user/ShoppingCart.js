// models/ShoppingCart.js
const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema({
    totalPrice: {
        type: Number, // NumberFloat
        required: true,
        default: 0
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);