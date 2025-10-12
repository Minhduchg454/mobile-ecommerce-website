const router = require("express").Router();
const userController = require("./user.controller");
const uploadCloud = require("../../config/cloudinary.config");
const { verifyAccessToken } = require("../../middlewares/verifyToken");

router.get("/current", verifyAccessToken, userController.getCurrent);
router.put(
  "/profile/:uId",
  uploadCloud.single("userAvatar"),
  userController.updateUser
);

module.exports = router;
