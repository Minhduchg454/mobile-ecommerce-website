// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    totalPrice: {
        type: Number, // NumberDouble
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now // Tự động điền ngày hiện tại khi tạo
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], // Gợi ý các trạng thái
        default: 'Pending'
    },
    // Mối quan hệ với Address (Order "Gắn với" Address)
    // Mỗi Order sẽ tham chiếu đến một Address cụ thể đã được tạo.
    shippingAddress: { // Đặt tên rõ ràng hơn là shippingAddress
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    // Mối quan hệ với ShippingProvider (Order "Gắn với" ShippingProvider)
    shippingProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShippingProvider',
        required: true
    },
    // Bạn có thể muốn thêm trường để lưu trữ người dùng tạo đơn hàng
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    // Hoặc danh sách các sản phẩm trong đơn hàng
    // products: [
    //     {
    //         product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    //         quantity: Number,
    //         price: Number
    //     }
    // ]
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Order', orderSchema);