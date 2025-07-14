// routes/auth.route.js
const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth/auth.controller");

router.post("/google", authCtrl.googleLogin);

module.exports = router;
