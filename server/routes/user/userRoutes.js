const express = require("express");
const router = express.Router();
const userCtrl = require("../../controllers/user/userController");
const { verifyAccessToken } = require("../../middlewares/verifyToken");
const uploadCloud = require("../../config/cloudinary.config"); // middleware multer-cloudinary

router.post("/login", userCtrl.login);
router.post("/", userCtrl.register);
// Route lấy user hiện tại, cần xác thực token
router.get("/current", verifyAccessToken, userCtrl.getCurrent);
// Nếu có route /cart, hãy thêm ở đây trước /:id
// router.get('/cart', ...);

router.get("/:id", userCtrl.getUserById);
router.put("/:id", uploadCloud.single("avatar"), userCtrl.updateUser);
router.delete("/:id", userCtrl.deleteUser);
router.get("/", userCtrl.getUsers);

module.exports = router;
