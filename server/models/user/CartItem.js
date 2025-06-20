// models/CartItem.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    quantity: {
        type: Number, // NumberInt
        required: true,
        min: 1 // Số lượng ít nhất là 1
    },
    // Giá của mặt hàng này khi thêm vào giỏ (có thể là giá hiện tại của sản phẩm)
    price: {
        type: Number, // NumberDouble
        required: true
    },
    // Mối quan hệ với ShoppingCart: Mỗi CartItem thuộc về một ShoppingCart
    shoppingCart: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của ShoppingCart
        ref: 'ShoppingCart',
        required: true
    },
    // Mối quan hệ với Product/ProductVariations: Mỗi CartItem là một sản phẩm cụ thể
    product: { // Có thể là Product hoặc ProductVariations tùy vào cấu trúc của bạn
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation', // Giả sử bạn tham chiếu đến ProductVariation
        required: true
    },
});

module.exports = mongoose.model('CartItem', cartItemSchema);