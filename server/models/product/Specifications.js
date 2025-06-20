// models/Specifications.js
const mongoose = require('mongoose');

const specificationsSchema = new mongoose.Schema({
    typeSpecifications: { // Theo biểu đồ: typeSpecifications: String
        type: String,
        required: true,
        unique: true, // Tên loại thông số kỹ thuật thường là duy nhất
        trim: true
    },
    unitOfMeasure: { // Theo biểu đồ: unitOfMeasure: String
        type: String,
        trim: true // Đơn vị đo lường (ví dụ: "kg", "cm", "%")
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Specifications', specificationsSchema);