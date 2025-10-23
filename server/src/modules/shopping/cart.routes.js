const router = require("express").Router();
const controller = require("./cart.controller");

/**
 * Shopping Cart
 */
router.get("/carts", controller.getAllCarts);
router.get("/carts/:cId", controller.getCart);
router.put("/carts/:cId", controller.updateCart);
router.delete("/carts/:cId", controller.deleteCart);

module.exports = router;

/**
 * Cart Item
 */

router.post("/cart-item/", controller.createCartItem);
router.get("/cart-item/", controller.getCartItems);
router.get("/cart-item/count", controller.getCartItemCount);
router.delete("/cart-item/clear", controller.clearCartItems);
router.get("/cart-item/:id", controller.getCartItem);
router.put("/cart-item/:id", controller.updateCartItem);
router.delete("/cart-item/:id", controller.deleteCartItem);

/**
 * WishList
 */

router.post("/wishlist/", controller.createWishList); // body: { customerId, pvId }
router.get("/wishlist/", controller.getWishList); // lấy toàn bộ
router.get("/wishlist/search", controller.getWishListByQuery); // query: ?customerId=&pvId=
router.delete("/wishlist", controller.deleteWishListByCondition); // query: ?customerId=&pvId=
router.delete("/wishlist/clear", controller.deleteAllWishListByCustomerId); // query: ?customerId=
router.put("/wishlist/:id", controller.updateWishList); // body: { pvId }
router.delete("/wishlist/:id", controller.deleteWishList); // :id là wishlist item id
