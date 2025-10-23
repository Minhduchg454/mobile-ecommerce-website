const router = require("express").Router();
const userController = require("./user.controller");
const uploadCloud = require("../../config/cloudinary.config");
const { verifyAccessToken } = require("../../middlewares/verifyToken");

/**
 * User
 */
router.get("/current", verifyAccessToken, userController.getCurrent);
router.put(
  "/profile/:uId",
  uploadCloud.single("userAvatar"),
  userController.updateUser
);

/**
 * Address
 */

router.post("/addresses", userController.createAddress);
router.get("/addresses", userController.getAddresses);
router.put("/addresses/:addressId", userController.updateAddress);
router.delete("/addresses/:addressId", userController.deleteAddress);

module.exports = router;
