// models/Preview.js
const mongoose = require('mongoose');

const previewSchema = new mongoose.Schema({
    previewComment: { // previewComent trong biểu đồ, sửa thành previewComment cho rõ ràng
        type: String,
        trim: true
    },
    previewDate: {
        type: Date,
        default: Date.now // Tự động điền ngày hiện tại khi tạo
    },
    previewRating: {
        type: Number, // NumberInt
        required: true,
        min: 1, // Điểm đánh giá thường từ 1
        max: 5 // Điểm đánh giá thường đến 5
    },
    // Mối quan hệ với Customer: Mỗi Preview thuộc về một Customer
    customer: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Customer
        ref: 'Customer', // Tên model Customer
        required: true
    },
    // Mối quan hệ với ProductVariations: Mỗi Preview đánh giá một ProductVariations cụ thể
    productVariation: { // Đặt tên rõ ràng hơn là productVariation
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của ProductVariations
        ref: 'ProductVariations', // Tên model ProductVariations
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Preview', previewSchema);