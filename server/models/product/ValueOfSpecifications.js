// models/ValueOfSpecifications.js
const mongoose = require('mongoose');

const valueOfSpecificationsSchema = new mongoose.Schema({
    value: { // Theo biểu đồ: value: NumberInt. Thường sẽ là String cho các giá trị như "Red", "XL"
        type: String, // Đổi từ NumberInt sang String để linh hoạt hơn
        required: true,
        trim: true
    },
    // Mối quan hệ với Specifications (ValueOfSpecifications thuộc về một Specifications)
    specificationType: { // Tham chiếu đến loại thông số kỹ thuật mà giá trị này thuộc về
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specifications', // Tên model Specifications
        required: true
    },
    productVariation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation', // Giả sử bạn có model Product
        required: true
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('ValueOfSpecifications', valueOfSpecificationsSchema);