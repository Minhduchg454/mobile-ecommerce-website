const express = require("express");
const router = express.Router();

//import modules
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const shopRoutes = require("../modules/shop/shop.routes");
const productRoutes = require("../modules/product/product.routes");

//gan vao prefix
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/shop", shopRoutes);
router.use("/catalog", productRoutes);

module.exports = router;
