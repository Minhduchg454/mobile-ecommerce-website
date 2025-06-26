// routes/user/coupon.js
// Định nghĩa các route liên quan đến Coupon (Mã giảm giá)
const router = require('express').Router()
const { verifyAccessToken, isAdmin } = require('../../middlewares/verifyToken')
const ctrls = require('../../controllers/product/couponController')

// Tạo mới một coupon (chỉ admin)
router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewCoupon)

// Cập nhật thông tin coupon (chỉ admin)
router.put('/:cid', [verifyAccessToken, isAdmin], ctrls.updateCoupon)

// Xóa coupon (chỉ admin)
router.delete('/:cid', [verifyAccessToken, isAdmin], ctrls.deleteCoupon)

// Lấy danh sách tất cả coupon
router.get('/', ctrls.getCoupons)

// Lấy thông tin một coupon theo id hoặc code
router.get('/single', ctrls.getSingleCoupon)

module.exports = router