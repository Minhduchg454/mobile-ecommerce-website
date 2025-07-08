const router = require("express").Router();
const ctrls = require("../../controllers/user/roleController");
const { verifyAccessToken, isAdmin } = require("../../middlewares/verifyToken");

// Kiểm tra nếu không phải môi trường production thì cho phép thao tác CRUD role
const isNotProduction = process.env.NODE_ENV !== "production";

if (isNotProduction) {
  // Chỉ admin mới được tạo role mới
  router.post("/", verifyAccessToken, isAdmin, ctrls.createRole);
  // Chỉ admin mới được cập nhật role
  router.put("/:id", verifyAccessToken, isAdmin, ctrls.updateRole);
  // Chỉ admin mới được xóa role
  router.delete("/:id", verifyAccessToken, isAdmin, ctrls.deleteRole);
} else {
  // Nếu là production, các API POST/PUT/DELETE role sẽ bị vô hiệu hóa để bảo vệ hệ thống
  router.post("/", (req, res) =>
    res.status(403).json({
      success: false,
      mes: "POST /api/role is disabled in production!",
    })
  );
  router.put("/:id", (req, res) =>
    res
      .status(403)
      .json({ success: false, mes: "PUT /api/role is disabled in production!" })
  );
  router.delete("/:id", (req, res) =>
    res.status(403).json({
      success: false,
      mes: "DELETE /api/role is disabled in production!",
    })
  );
}

// Ai cũng có thể lấy danh sách role (GET)
router.get("/", ctrls.getRoles);

module.exports = router;
