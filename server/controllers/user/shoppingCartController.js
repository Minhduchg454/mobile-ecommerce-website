const ShoppingCart = require("../../models/user/ShoppingCart");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// Tạo mới giỏ hàng
exports.createCart = asyncHandler(async (req, res) => {
  // 1. Lấy dữ liệu từ body
  let { userId, totalPrice } = req.body;
  // 2. Kiểm tra required userId
  if (!userId) {
    return res.status(400).json({ error: "Missing required field: userId" });
  }
  // 3. Ép kiểu ObjectId cho userId, trả về lỗi nếu không hợp lệ
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({
        error: "Invalid userId format. Must be a 24-character hex string.",
      });
  }
  // 4. Tự động sửa totalPrice về 0 nếu âm hoặc không hợp lệ
  if (typeof totalPrice !== "number" || totalPrice < 0) totalPrice = 0;
  // 5. Tạo mới shopping cart
  const cart = await ShoppingCart.create({
    userId: mongoose.Types.ObjectId(userId),
    totalPrice,
  });
  return res.status(201).json({ success: true, cart });
});

// Lấy thông tin giỏ hàng theo id
exports.getCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await ShoppingCart.findById(id);
  if (!cart)
    return res.status(404).json({ success: false, mes: "Cart not found" });
  return res.json({ success: true, cart });
});

// Cập nhật giỏ hàng
exports.updateCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let updateData = { ...req.body };
  if (typeof updateData.totalPrice === "number" && updateData.totalPrice < 0) {
    updateData.totalPrice = 0;
  }
  const updated = await ShoppingCart.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return res.json({ success: !!updated, cart: updated || "Update failed" });
});

// Xóa giỏ hàng
exports.deleteCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ShoppingCart.findByIdAndDelete(id);
  return res.json({
    success: !!deleted,
    mes: deleted ? "Cart deleted" : "Delete failed",
  });
});

// Lấy tất cả giỏ hàng
exports.getAllCarts = asyncHandler(async (req, res) => {
  const carts = await ShoppingCart.find();
  return res.json({ success: true, carts });
});
