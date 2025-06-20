// models/SpecificProduct.js
const mongoose = require('mongoose');

const specificProductSchema = new mongoose.Schema({
    // Trong hình ảnh không có ID riêng cho SpecificProduct,
    // ta có thể dùng _id của MongoDB hoặc thêm 1 trường nếu cần.
    // Nếu bạn muốn một ID rõ ràng hơn ngoài _id của MongoDB:
    // specificProductId: {
    //     type: Number, // hoặc String tùy định dạng ID serial
    //     required: true,
    //     unique: true,
    //     index: true
    // },
    numberOfSeri: { // Theo biểu đồ: numberOfSeri: String
        type: String,
        required: true,
        unique: true, // Mỗi số serial là duy nhất
        trim: true,
        index: true
    },
    // Mối quan hệ với ProductVariation (SpecificProduct thuộc về một ProductVariation)
    productVariation: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của ProductVariation
        ref: 'ProductVariation', // Tên model ProductVariation
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('SpecificProduct', specificProductSchema);