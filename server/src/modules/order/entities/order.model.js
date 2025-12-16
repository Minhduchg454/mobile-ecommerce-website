// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderSubtotalPrice: {
      type: Number,
      required: true,
    },
    orderShippingFee: {
      type: Number,
      required: true,
    },
    orderShippingDiscount: {
      type: Number,
      default: 0,
    },
    orderShopDiscount: {
      type: Number,
      default: 0,
    },
    orderSystemDiscount: {
      type: Number,
      default: 0,
    },
    orderTotalPrice: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderDeliveryDate: {
      type: Date,
      default: null,
    },
    orderStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
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
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
