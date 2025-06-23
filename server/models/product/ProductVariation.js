// models/ProductVariation.js
const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
    productVariationName: {
        type: String,
        required: true,
        trim: true
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
        required: true,
        default: 0,
        min: 0
    },
    images: [{
        type: String,
        trim: true
    }],
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