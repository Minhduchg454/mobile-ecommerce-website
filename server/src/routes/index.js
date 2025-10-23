const express = require("express");
const router = express.Router();

//import modules
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const shopRoutes = require("../modules/shop/shop.routes");
const productRoutes = require("../modules/product/product.routes");
const shoppingRoutes = require("../modules/shopping/cart.routes");
const customerRoutes = require("../modules/customer/customer.routes");

//gan vao prefix
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/shop", shopRoutes);
router.use("/catalog", productRoutes);
router.use("/shopping", shoppingRoutes);
router.use("/customer", customerRoutes);

module.exports = router;
