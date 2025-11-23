// models/OrderDetail.js
const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
  odQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  odPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  pvId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariation",
    required: true,
  },
});

orderDetailSchema.index({ orderId: 1, pvId: 1 }, { unique: true });

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
