const router = require("express").Router();
const ctrls = require("../../controllers/user/cartItemController");

router.post("/", ctrls.createCartItem); // Thêm sản phẩm vào giỏ
router.get("/", ctrls.getCartItems); // Lấy danh sách theo shoppingCart
router.get("/count", ctrls.getCartItemCount); // Đếm tổng quantity
router.get("/clear", ctrls.clearCartItems); // Xoá toàn bộ giỏ hàng
router.get("/:id", ctrls.getCartItem); // Lấy 1 CartItem
router.put("/:id", ctrls.updateCartItem); // Cập nhật CartItem
router.delete("/:id", ctrls.deleteCartItem); // Xoá CartItem

module.exports = router;
