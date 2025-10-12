// models/ShoppingCart.js
const mongoose = require("mongoose");

// Định nghĩa schema cho giỏ hàng của khách hàng
const shoppingCartSchema = new mongoose.Schema(
  {
    cartTotalPrice: {
      type: Number, // Tổng giá trị giỏ hàng
      required: true,
      default: 0,
      min: [0, "totalPrice không được âm"],
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
