// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentStatus: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["VNpay", "COD", "QR", "BANK"],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
    ref: "Order", // Tên model mà chúng ta đang tham chiếu
    required: true,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
