//. /modules/cart/cart.service.js
const Cart = require("./entities/shopping-cart.model");
const WishList = require("./entities/wish-list.model");

exports.createCart = async () => {
  try {
    const shoppingCart = await Cart.create({ cartTotalPrice: 0 });
    return {
      success: true,
      cart: shoppingCart,
    };
  } catch (err) {
    console.error("Lỗi khi tạo giỏ hàng:", err);
    const error = new Error("Không thể tạo giỏ hàng, vui lòng thử lại");
    error.status = 500;
    throw error;
  }
};

exports.createWishList = async () => {};
