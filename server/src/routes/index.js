const express = require("express");
const router = express.Router();

//import modules
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const shopRoutes = require("../modules/shop/shop.routes");
const productRoutes = require("../modules/product/product.routes");
const shoppingRoutes = require("../modules/shopping/cart.routes");
const customerRoutes = require("../modules/customer/customer.routes");
const couponRoutes = require("../modules/coupon/coupon.routes");
const paymentRoutes = require("../modules/payment/payment.routes");
const orderRoutes = require("../modules/order/order.routes");

//gan vao prefix
router.use("/auths", authRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/catalogs", productRoutes);
router.use("/shoppings", shoppingRoutes);
router.use("/customers", customerRoutes);
router.use("/coupons", couponRoutes);
router.use("/payments", paymentRoutes);
router.use("/orders", orderRoutes);
module.exports = router;
