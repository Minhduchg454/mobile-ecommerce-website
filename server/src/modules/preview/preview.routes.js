const router = require("express").Router();
const previewController = require("./preview.controller");
const { verifyAccessToken } = require("../../middlewares/verifyToken"); // Giả sử có
const uploadCloud = require("../../config/cloudinary.config");

// 1. Lấy danh sách đánh giá (Có thể công khai)
router.get("/products", previewController.getPreview);

// 2. Tạo đánh giá (Cần xác thực Khách hàng)
router.post(
  "/products",
  uploadCloud.fields([
    { name: "previewImages", maxCount: 10 },
    { name: "previewVideos", maxCount: 1 },
  ]),
  previewController.createPreview
);

router.put(
  "/products/:pId",
  uploadCloud.fields([
    { name: "previewImages", maxCount: 10 },
    { name: "previewVideos", maxCount: 1 },
  ]),
  previewController.updatePreview
);

router.delete("/products/:pId", previewController.deletePreview);

module.exports = router;
