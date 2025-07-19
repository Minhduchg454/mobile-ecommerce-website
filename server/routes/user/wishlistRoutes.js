const router = require("express").Router();
const wishlistCtrl = require("../../controllers/user/wishlistController");
const { verifyAccessToken } = require("../../middlewares/verifyToken");

// Lấy danh sách wishlist của user
router.get("/", verifyAccessToken, wishlistCtrl.getWishlist);

// Toggle wishlist - thêm hoặc xóa sản phẩm khỏi wishlist
router.put("/:productId", verifyAccessToken, wishlistCtrl.toggleWishlist);

// Xóa sản phẩm khỏi wishlist
router.delete("/:productId", verifyAccessToken, wishlistCtrl.removeFromWishlist);

// Xóa tất cả sản phẩm khỏi wishlist
router.delete("/", verifyAccessToken, wishlistCtrl.clearWishlist);

module.exports = router; 