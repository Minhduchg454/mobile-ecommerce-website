const CartItem = require("../../models/user/CartItem");
const ShoppingCart = require("../../models/user/ShoppingCart");
const asyncHandler = require("express-async-handler");

//Cập nhật lại tổng giá trị giỏ hàng
const updateCartTotalPrice = async (shoppingCartId) => {
  const items = await CartItem.find({ shoppingCart: shoppingCartId });
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  await ShoppingCart.findByIdAndUpdate(shoppingCartId, { totalPrice: total });
};

//Tạo mới CartItem hoặc tăng số lượng nếu trùng
exports.createCartItem = asyncHandler(async (req, res) => {
  const { quantity, price, shoppingCart, productVariationId } = req.body;
  if (!quantity || !price || !shoppingCart || !productVariationId) {
    return res
      .status(400)
      .json({ success: false, mes: "Missing required fields" });
  }

  const existingItem = await CartItem.findOne({
    shoppingCart,
    productVariationId,
  });
  let cartItem;
  if (existingItem) {
    existingItem.quantity += quantity;
    cartItem = await existingItem.save();
  } else {
    cartItem = await CartItem.create({
      quantity,
      price,
      shoppingCart,
      productVariationId,
    });
  }

  await updateCartTotalPrice(shoppingCart);
  return res.status(201).json({ success: true, cartItem });
});

//Lấy danh sách CartItem theo shoppingCart
exports.getCartItems = asyncHandler(async (req, res) => {
  const { shoppingCart } = req.query;
  if (!shoppingCart)
    return res
      .status(400)
      .json({ success: false, mes: "Missing shoppingCart" });

  const cartItems = await CartItem.find({ shoppingCart }).populate({
    path: "productVariationId",
    populate: {
      path: "productId",
      select: "title thumbnail price",
    },
  });

  return res.json({ success: true, cartItems });
});

//Cập nhật CartItem
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await CartItem.findByIdAndUpdate(id, req.body, { new: true });

  if (updated) {
    await updateCartTotalPrice(updated.shoppingCart);
  }
  return res.json({ success: !!updated, cartItem: updated || "Update failed" });
});

//Xóa CartItem
exports.deleteCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await CartItem.findByIdAndDelete(id);
  if (deleted) {
    await updateCartTotalPrice(deleted.shoppingCart);
  }
  return res.json({
    success: !!deleted,
    mes: deleted ? "CartItem deleted" : "Delete failed",
  });
});

//Lấy CartItem theo id
exports.getCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cartItem = await CartItem.findById(id).populate({
    path: "productVariationId",
    populate: { path: "productId", select: "title thumbnail price" },
  });
  if (!cartItem)
    return res.status(404).json({ success: false, mes: "CartItem not found" });
  return res.json({ success: true, cartItem });
});

//Xoá toàn bộ sản phẩm trong giỏ
exports.clearCartItems = asyncHandler(async (req, res) => {
  const { shoppingCart } = req.query;
  if (!shoppingCart)
    return res
      .status(400)
      .json({ success: false, mes: "Missing shoppingCart" });

  await CartItem.deleteMany({ shoppingCart });
  await updateCartTotalPrice(shoppingCart);
  return res.json({ success: true, mes: "All items removed from cart" });
});

//Lấy tổng số lượng item trong giỏ
exports.getCartItemCount = asyncHandler(async (req, res) => {
  const { shoppingCart } = req.query;
  if (!shoppingCart)
    return res
      .status(400)
      .json({ success: false, mes: "Missing shoppingCart" });

  const items = await CartItem.find({ shoppingCart });
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return res.json({ success: true, count });
});
