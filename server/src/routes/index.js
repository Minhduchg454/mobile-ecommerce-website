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
const chatBotRouter = require("../modules/chatBot/chatbot.router");
const previewRouter = require("../modules/preview/preview.routes");
const notificationRouter = require("../modules/notification/notification.router");
const recommendationRouter = require("../modules/recommenderSystem/recommenderSystem.router");
const chatRouter = require("../modules/chat/chat.routes");

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
router.use("/chatbots", chatBotRouter);
router.use("/previews", previewRouter);
router.use("/notifications", notificationRouter);
router.use("/recommendations", recommendationRouter);
router.use("/chats", chatRouter);

module.exports = router;
