// models/CouponProductVariation.js
const mongoose = require('mongoose');

const couponProductVariationSchema = new mongoose.Schema({
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true,
        index: true
    },
    variationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation',
        required: true,
        index: true
    },
}, {
    timestamps: true
});

couponProductVariationSchema.index({ couponId: 1, variationId: 1 }, { unique: true });

module.exports = mongoose.model('CouponProductVariation', couponProductVariationSchema);