// models/Preview.js
const mongoose = require('mongoose');

// Định nghĩa schema cho đánh giá sản phẩm của khách hàng
const previewSchema = new mongoose.Schema({
    previewComment: {
        type: String, // Nội dung đánh giá
        trim: true
    },
    previewDate: {
        type: Date, // Ngày đánh giá
        default: Date.now
    },
    previewRating: {
        type: Number, // Điểm đánh giá (1-5)
        required: true,
        min: 1,
        max: 5
    },
    // Liên kết với User: mỗi Preview thuộc về một User (khách hàng)
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến User
        ref: 'User',
        required: true
    },
    // Liên kết với ProductVariation: mỗi Preview đánh giá một ProductVariation cụ thể
    productVariationId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ProductVariation
        ref: 'ProductVariation',
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Preview', previewSchema);