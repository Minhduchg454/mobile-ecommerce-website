// models/Payment.js
const mongoose = require('mongoose');
const Order = require('./Order')

const paymentSchema = new mongoose.Schema({
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'], // Gợi ý các trạng thái phổ biến
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Credit Card', 'Cash on Delivery', 'Bank Transfer', 'E-Wallet'], // Gợi ý các phương thức
    },
    paymentDate: {
        type: Date,
        default: Date.now // Tự động điền ngày hiện tại khi tạo
    },
    amount: {
        type: Number, // NumberDouble
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
        ref: 'Order', // Tên model mà chúng ta đang tham chiếu
        required: true
    },
});

// ✅ Hook kiểm tra orderId có tồn tại không
paymentSchema.pre('save', async function (next) {
    try {
        const orderExists = await Order.findById(this.orderId);
        console.log("hi")
        if (!orderExists) {
            return next(new Error('Đơn hàng không tồn tại với ID đã cung cấp.'));
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Payment', paymentSchema);