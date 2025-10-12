// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderTotalPrice: {
      type: Number, // NumberDouble
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now, // Tự động điền ngày hiện tại khi tạo
    },
    orderDeliveryDate: {
      type: Date,
      default: null, // Mặc định không có giá trị
    },
    //khoa ngoai
    orderStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
    },
    spId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingProvider",
      required: false,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema);
