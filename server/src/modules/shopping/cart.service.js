//. /modules/cart/cart.service.js
const ShoppingCart = require("./entities/shopping-cart.model");
const WishList = require("./entities/wish-list.model");
const CartItem = require("./entities/cart-item.model");

/**
 * Shopping Cart
 */
exports.createCart = async () => {
  try {
    const shoppingCart = await ShoppingCart.create({ cartTotalPrice: 0 });
    return {
      success: true,
      message: "Tạo giỏ hàng thành công",
      cart: shoppingCart,
    };
  } catch (err) {
    console.error("Lỗi khi tạo giỏ hàng:", err);
    const error = new Error("Không thể tạo giỏ hàng, vui lòng thử lại");
    error.status = 500;
    throw error;
  }
};

exports.getCart = async (cId) => {
  const cart = await ShoppingCart.findById(cId);
  if (!cart) {
    const err = new Error(
      "Không tìm thấy giỏ hàng của người dùng, liên hệ quản trị viên"
    );
    err.status = 404;
    throw err;
  }
  return {
    success: true,
    message: "Lấy giỏ hàng thành công",
    cart,
  };
};

exports.updateCart = async (cId, payload = {}) => {
  let updateData = { ...payload };
  if (
    typeof updateData.cardTotalPrice === "number" &&
    updateData.totalPrice < 0
  ) {
    updateData.totalPrice = 0;
  }

  const updated = await ShoppingCart.findByIdAndUpdate(cId, updateData, {
    new: true,
  });

  if (!updated) {
    const err = new Error("Không tìm thấy giỏ hàng để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật giỏ hàng thành công",
    cart: updated,
  };
};

exports.deleteCart = async (cId) => {
  const deleted = await ShoppingCart.findByIdAndDelete(cId);
  if (!deleted) {
    const err = new Error("Không tìm thấy giỏ hàng để xóa");
    err.status = 404;
    throw err;
  }
  return {
    success: true,
    message: "Xóa giỏ hàng thành công",
  };
};

exports.getAllCarts = async () => {
  const carts = await ShoppingCart.find();
  return {
    success: true,
    message: "Lấy tất cả giỏ hàng thành công",
    carts,
  };
};

/**
 * Cart Items
 */

// Cập nhật lại tổng giá trị giỏ hàng
const updateCartTotalPrice = async (cartId) => {
  const items = await CartItem.find({ cartId });
  const total = items.reduce(
    (sum, item) => sum + item.cartItemQuantity * item.cartItemPrice,
    0
  );
  await ShoppingCart.findByIdAndUpdate(cartId, { CartTotalPrice: total });
};

// Tạo mới CartItem hoặc tăng số lượng nếu trùng
exports.createCartItem = async (payload) => {
  const { cartItemQuantity, cartItemPrice, cartId, pvId } = payload;
  if (!cartItemQuantity || !cartItemPrice || !cartId || !pvId) {
    const err = new Error("Thiếu thông tin cần thiết");
    err.status = 400;
    throw err;
  }

  const existingItem = await CartItem.findOne({ cartId, pvId });
  let cartItem;
  if (existingItem) {
    existingItem.cartItemQuantity += cartItemQuantity;
    cartItem = await existingItem.save();
  } else {
    cartItem = await CartItem.create({
      cartItemQuantity,
      cartItemPrice,
      cartId,
      pvId,
    });
  }

  await updateCartTotalPrice(cartId);
  return {
    success: true,
    message: "Tạo/Cập nhật CartItem thành công",
    cartItem,
  };
};

// Lấy danh sách CartItem theo cartId
exports.getCartItems = async ({ cartId }) => {
  if (!cartId) {
    const err = new Error("Thiếu mã Id của giỏ hàng");
    err.status = 400;
    throw err;
  }

  const cartItems = await CartItem.find({ cartId }).populate({
    path: "pvId",
    populate: {
      path: "productId",
      select:
        "productName productThumb productMinPrice productOriginalMinPrice",
    },
  });

  return {
    success: true,
    message: "Lấy danh sách CartItem thành công",
    cartItems,
  };
};

// Cập nhật CartItem
exports.updateCartItem = async (id, payload) => {
  //console.log("Loi goi update", id, payload);
  const updated = await CartItem.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    const err = new Error("CartItem không có");
    err.status = 404;
    throw err;
  }

  await updateCartTotalPrice(updated.cartId);
  return {
    success: true,
    message: "Cập nhật CartItem thành công",
    cartItem: updated,
  };
};

// Xóa CartItem
exports.deleteCartItem = async (id) => {
  const deleted = await CartItem.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Không tồn tại giỏ hàng");
    err.status = 404;
    throw err;
  }

  await updateCartTotalPrice(deleted.cartId);
  return { success: true, message: "Xóa CartItem thành công" };
};

// Lấy CartItem theo id
exports.getCartItem = async (id) => {
  const cartItem = await CartItem.findById(id).populate({
    path: "pvId",
    populate: {
      path: "productId",
      select:
        "productName productThumb productMinPrice productOriginalMinPrice",
    },
  });

  if (!cartItem) {
    const err = new Error("CartItem not found");
    err.status = 404;
    throw err;
  }

  return { success: true, message: "Lấy CartItem thành công", cartItem };
};

// Xoá toàn bộ sản phẩm trong giỏ
exports.clearCartItems = async ({ cartId }) => {
  if (!cartId) {
    const err = new Error("Không tồn tại cartId");
    err.status = 400;
    throw err;
  }

  await CartItem.deleteMany({ cartId });
  await updateCartTotalPrice(cartId);
  return { success: true, message: "Đã xoá toàn bộ sản phẩm trong giỏ" };
};

// Lấy tổng số lượng item trong giỏ
exports.getCartItemCount = async ({ cartId }) => {
  if (!cartId) {
    const err = new Error("Không tồn tại cartId");
    err.status = 400;
    throw err;
  }

  const items = await CartItem.find({ cartId });
  const count = items.reduce((sum, item) => sum + item.cartItemQuantity, 0);
  return {
    success: true,
    message: "Lấy tổng số lượng sản phẩm trong giỏ thành công",
    count,
  };
};

/**
 * WishList
 */
exports.createWishList = async (payload = {}) => {
  try {
    const { customerId, pvId } = payload;
    if (!customerId || !pvId) {
      const err = new Error("Thiếu customerId hoặc pvId");
      err.status = 400;
      throw err;
    }

    // Kiểm tra sản phẩm đã tồn tại trong wishlist chưa
    const existed = await WishList.findOne({ customerId, pvId });
    if (existed) {
      const err = new Error("Sản phẩm đã có trong wishlist");
      err.status = 400;
      throw err;
    }

    const wishItem = await WishList.create({ customerId, pvId });
    return {
      success: true,
      message: "Thêm sản phẩm vào wishlist thành công",
      wishItem,
    };
  } catch (err) {
    if (!err.status) {
      console.error("Lỗi khi tạo wishlist item:", err);
      err = new Error("Không thể tạo wishlist, vui lòng thử lại");
      err.status = 500;
    }
    throw err;
  }
};

/**
 * Lấy toàn bộ wishlist
 */
exports.getWishList = async () => {
  const wishList = await WishList.find()
    .populate("pvId", "pvName pvStockQuantity pvImages pvOriginalPrice pvPrice")
    .populate({
      path: "customerId",
      populate: {
        path: "_id",
        model: "User",
        select: "userAvatar userFirstName userLastName",
      },
    });

  return {
    success: true,
    message: "Lấy wishlist thành công",
    wishList,
  };
};

exports.getWishListByQuery = async (query = {}) => {
  const filters = { ...query };
  const wishList = await WishList.find(filters)
    .populate("pvId", "pvName pvStockQuantity pvImages pvOriginalPrice pvPrice")
    .populate({
      path: "customerId",
      populate: {
        path: "_id",
        model: "User",
        select: "userAvatar userFirstName userLastName",
      },
    });

  return {
    success: true,
    message: "Lấy wishlist theo điều kiện thành công",
    wishList,
  };
};

exports.updateWishList = async (id, payload = {}) => {
  const { pvId } = payload;
  const updated = await WishList.findByIdAndUpdate(
    id,
    { ...(pvId && { pvId }) },
    { new: true }
  );

  if (!updated) {
    const err = new Error("Không tìm thấy wishlist item để cập nhật");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật wishlist thành công",
    wishItem: updated,
  };
};

exports.deleteWishList = async (id) => {
  const deleted = await WishList.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Không tìm thấy wishlist item để xóa");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Xóa sản phẩm khỏi wishlist thành công",
  };
};

exports.deleteWishListByCondition = async (query = {}) => {
  const { customerId, pvId } = query;

  if (!customerId || !pvId) {
    const err = new Error("Thiếu customerId hoặc pvId");
    err.status = 400;
    throw err;
  }

  const deleted = await WishList.findOneAndDelete({ customerId, pvId });

  if (!deleted) {
    const err = new Error("Không tìm thấy sản phẩm trong wishlist");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Đã xóa sản phẩm khỏi wishlist",
  };
};

exports.deleteAllWishListByCustomerId = async (customerId) => {
  console.log("Nhan thong tin", customerId);
  if (!customerId) {
    const err = new Error("Thiếu customerId");
    err.status = 400;
    throw err;
  }

  const result = await WishList.deleteMany({ customerId });

  return {
    success: true,
    message:
      result.deletedCount > 0
        ? `Đã xóa toàn bộ (${result.deletedCount}) sản phẩm khỏi wishlist`
        : "Người dùng không có sản phẩm nào trong wishlist",
  };
};
