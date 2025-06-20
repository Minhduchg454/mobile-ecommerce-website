// models/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        unique: true, // Tên thương hiệu thường là duy nhất
        trim: true
    }
});

module.exports = mongoose.model('Brand', brandSchema);