// modules/auth/auth.routes.js
const router = require("express").Router();
const authController = require("./auth.controller");
const uploadCloud = require("../../config/cloudinary.config");

router.post("/register/customer", authController.registerCustomer);
router.post("/register/admin", authController.registerAdmin);
router.post(
  "/register/shop",
  uploadCloud.fields([
    { name: "shopLogo", maxCount: 1 },
    { name: "shopBackground", maxCount: 1 },
    { name: "shopBanner", maxCount: 10 }, // nhiều ảnh
  ]),
  authController.registerShop
);
router.post("/login", authController.login);
router.post("/google-login", authController.login);

module.exports = router;
