// models/SpecificProduct.js
const mongoose = require('mongoose');

const specificProductSchema = new mongoose.Schema({
    //Su dung _id mac dinh cua mongoose va thiet lap numberOfSeri la mot truong duy nhat
    numberOfSeri: { // Theo biểu đồ: numberOfSeri: String
        type: String,
        required: true,
        unique: true, // Mỗi số serial là duy nhất
        trim: true,
        index: true
    },
    // Mối quan hệ với ProductVariation (SpecificProduct thuộc về một ProductVariation)
    productVariationId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của ProductVariation
        ref: 'ProductVariation', // Tên model ProductVariation
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('SpecificProduct', specificProductSchema);