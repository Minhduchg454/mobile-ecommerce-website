const router = require('express').Router();
const ctrls = require('../../controllers/product/couponProductVariationController');

// Create new coupon-product variation link
router.post('/', ctrls.createCouponProductVariation);

// Get all coupon-product variation links
router.get('/', ctrls.getCouponProductVariations);


// Update link by ID
router.put('/:id', ctrls.updateCouponProductVariation);

// Delete link by ID
router.delete('/:id', ctrls.deleteCouponProductVariation);

module.exports = router;