// routes/auth.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Bước 1: Redirect đến Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Bước 2: Xử lý sau khi Google xác thực xong
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Redirect về frontend kèm token
    res.redirect(`http://localhost:3000/login-success?token=${token}`);
  }
);

module.exports = router;
