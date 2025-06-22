const router = require('express').Router();
const ctrls = require('../../controllers/product/couponController');

// Create coupon (POST /api/coupons)
router.post('/', ctrls.createNewCoupon);

// Get all coupons (GET /api/coupons)
router.get('/', ctrls.getCoupons);

// Get a single coupon by id or code (GET /api/coupons/single?id=... hoặc ?code=...)
router.get('/single', ctrls.getSingleCoupon);

// Update a coupon (PUT /api/coupons/:cid)
router.put('/:cid', ctrls.updateCoupon);

// Delete a coupon (DELETE /api/coupons/:cid)
router.delete('/:cid', ctrls.deleteCoupon);

module.exports = router;