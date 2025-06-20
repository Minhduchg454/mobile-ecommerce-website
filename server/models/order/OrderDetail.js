// models/OrderDetail.js
const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    quantity: {
        type: Number, // NumberInt
        required: true,
        min: 1 // Đảm bảo số lượng ít nhất là 1
    },
    price: {
        type: Number, // NumberDouble (đây là giá của từng item hoặc giá tổng của item đó trong order detail)
        required: true
    },
    // Mối quan hệ với Order: Mỗi OrderDetail thuộc về một Order
    order: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
        ref: 'Order', // Tên model mà chúng ta đang tham chiếu
        required: true
    },
    // Bạn có thể muốn thêm một tham chiếu đến sản phẩm mà chi tiết này mô tả
    productVariation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation', // Giả sử bạn có model Product
        required: true
    },
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);