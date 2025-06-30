// models/ProductVariation.js
const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
    productVariationName: {
        type: String,
        required: true,
        trim: true
    },
    slug: { // URL thân thiện, thường được tạo từ productName
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    price: { // Theo biểu đồ: price: NumberDouble
        type: Number,
        required: true,
        min: 0
    },
    stockQuantity: { // Số lượng tồn kho
        type: Number, // NumberInt
        required: true,
        default: 0,
        min: 0
    },
    sold: { // Số lượng đã bán của biến thể này
        type: Number, // NumberInt
        default: 0,
        min: 0
    },
    images: [{
        type: String,
        trim: true
    }],
    rating: { // Đánh giá trung bình của biến thể này
        type: Number, // Sử dụng NumberDouble để lưu trữ giá trị thập phâ
        default: 0,
        min: 0,
        max: 5
    },
    totalRating: { // Tổng số lượt đánh giá
        type: Number, // Sử dụng NumberInt để lưu trữ số nguyên
        default: 0,
        min: 0
    },
    // Mối quan hệ với Product (ProductVariation thuộc về một Product)
    productId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Product
        ref: 'Product', // Tên model Product
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('ProductVariation', productVariationSchema);