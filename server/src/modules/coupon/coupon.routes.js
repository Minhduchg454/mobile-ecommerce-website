// routes/coupon.routes.js
const router = require("express").Router();
const controller = require("./coupon.controller");

router.post("/", controller.createCoupon);
router.get("/", controller.getCoupons);
router.get("/code/:couponCode", controller.getCouponByCode);
router.put("/:id", controller.updateCoupon);
router.delete("/:id", controller.deleteCoupon);

module.exports = router;
