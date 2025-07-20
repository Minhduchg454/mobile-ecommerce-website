const router = require("express").Router();
const ctrls = require("../../controllers/user/wishListController");

// Xóa theo điều kiện userId và productVariationId
router.delete("/byCondition", ctrls.deleteWishListByCondition); // DELETE /api/wishlist/by-condition?userId=...&productVariationId=...

// Tạo mới một mục yêu thích (có thể truyền customerId và productVariationId)
router.post("/", ctrls.createWishList); // POST /api/wishlist

// Lấy thông tin wishlist theo id
router.get("/:id", ctrls.getWishList); // GET /api/wishlist/:id

// Cập nhật wishlist (nếu cần thêm metadata hoặc chuyển đổi sản phẩm)
router.put("/:id", ctrls.updateWishList); // PUT /api/wishlist/:id

// Xóa mục yêu thích theo id
router.delete("/:id", ctrls.deleteWishList); // DELETE /api/wishlist/:id

// Lấy toàn bộ wishlist của một khách hàng (filter bằng customerId hoặc thêm query)
router.get("/", ctrls.getWishListByQuery); // GET /api/wishlist?customerId=...

module.exports = router;
//Chinh sửa route lại mới
