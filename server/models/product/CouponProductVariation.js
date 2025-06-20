// models/CouponProductVariation.js
const mongoose = require('mongoose');

const couponProductVariationSchema = new mongoose.Schema({
    // Khóa ngoại tham chiếu đến Coupon
    coupon: { // Theo biểu đồ: couponId (FK)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon', // Tên model Coupon
        required: true,
        index: true
    },
    // Khóa ngoại tham chiếu đến ProductVariation
    variation: { // Theo biểu đồ: variationId (FK)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation', // Tên model ProductVariation
        required: true,
        index: true
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm unique compound index để đảm bảo mỗi cặp couponId và variationId là duy nhất
couponProductVariationSchema.index({ coupon: 1, variation: 1 }, { unique: true });

module.exports = mongoose.model('CouponProductVariation', couponProductVariationSchema);