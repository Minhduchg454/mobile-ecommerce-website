const User = require("../../models/user/User");
const Product = require("../../models/product/Product");
const ProductVariation = require("../../models/product/ProductVariation");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// Toggle wishlist - thêm hoặc xóa sản phẩm vào wishlist
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Đây là productId thực sự
  const { id } = req.user;
  
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ success: false, mes: "Invalid productId" });
  }
  
  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, mes: "Product not found" });
  }
  
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, mes: "User not found" });
  
  if (!user.wishlist) user.wishlist = [];
  
  // Kiểm tra sản phẩm đã có trong wishlist chưa
  const existingIndex = user.wishlist.findIndex((item) => item.toString() === productId);
  
  if (existingIndex !== -1) {
    // Nếu đã có thì xóa khỏi wishlist
    user.wishlist.splice(existingIndex, 1);
    await user.save();
    return res.json({ success: true, mes: "Đã bỏ khỏi yêu thích!" });
  } else {
    // Nếu chưa có thì thêm vào wishlist
    user.wishlist.push(productId);
    await user.save();
    return res.json({ success: true, mes: "Đã thêm vào danh sách yêu thích!" });
  }
});

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { id } = req.user;
  
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ success: false, mes: "Invalid productId" });
  }
  
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, mes: "User not found" });
  
  if (!user.wishlist) user.wishlist = [];
  
  const existingIndex = user.wishlist.findIndex((item) => item.toString() === productId);
  
  if (existingIndex === -1) {
    return res.status(404).json({ success: false, mes: "Sản phẩm không có trong danh sách yêu thích" });
  }
  
  user.wishlist.splice(existingIndex, 1);
  await user.save();
  
  return res.json({ success: true, mes: "Đã xóa khỏi danh sách yêu thích!" });
});

// Lấy danh sách wishlist của user (trả về thông tin sản phẩm)
const getWishlist = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id)
    .populate({
      path: "wishlist",
      model: Product,
      select: "productName thumb categoryId brandId slug minPrice totalSold totalStock rating totalRating",
      populate: [
        { path: "categoryId", select: "productCategoryName slug" },
        { path: "brandId", select: "brandName" },
      ],
    });
  
  if (!user) return res.status(404).json({ success: false, mes: "User not found" });
  return res.json({ success: true, wishlist: user.wishlist || [] });
});

// Xóa tất cả sản phẩm khỏi wishlist
const clearWishlist = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, mes: "User not found" });
  user.wishlist = [];
  await user.save();
  return res.json({ success: true, mes: "Đã xóa toàn bộ wishlist" });
});

module.exports = {
  toggleWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
}; 