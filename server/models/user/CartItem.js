// models/CartItem.js
const mongoose = require('mongoose');

// Định nghĩa schema cho từng sản phẩm trong giỏ hàng
const cartItemSchema = new mongoose.Schema({
    quantity: {
        type: Number, // Số lượng sản phẩm
        required: true,
        min: 1 // Số lượng ít nhất là 1
    },
    // Giá của mặt hàng này khi thêm vào giỏ (có thể là giá hiện tại của sản phẩm)
    price: {
        type: Number, // Giá tại thời điểm thêm vào giỏ
        required: true
    },
    // Mối quan hệ với ShoppingCart: Mỗi CartItem thuộc về một ShoppingCart
    shoppingCart: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ShoppingCart
        ref: 'ShoppingCart',
        required: true
    },
    // Mối quan hệ với Product/ProductVariations: Mỗi CartItem là một sản phẩm cụ thể
    productVariationId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ProductVariation
        ref: 'ProductVariation',
        required: true
    },
});

module.exports = mongoose.model('CartItem', cartItemSchema);