// models/Address.js
const mongoose = require('mongoose');

// Định nghĩa schema cho địa chỉ giao hàng của User
const addressSchema = new mongoose.Schema({
    street: {
        type: String, // Địa chỉ đường/phố
        required: true,
        trim: true
    },
    ward: {
        type: String, // Phường/xã
        required: true,
        trim: true
    },
    district: {
        type: String, // Quận/huyện
        required: true,
        trim: true
    },
    country: {
        type: String, // Quốc gia
        required: true,
        trim: true
    },
    isDefault: {
        type: Boolean, // Đánh dấu địa chỉ mặc định
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của User
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Address', addressSchema);