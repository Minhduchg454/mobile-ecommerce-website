const router = require("express").Router();
const notificationController = require("./notification.controller");
const { verifyAccessToken } = require("../../middlewares/verifyToken"); // [Suy luận] Middleware xác thực

// 1. Lấy danh sách thông báo của người dùng hiện tại (Hỗ trợ query: isRead, type, page, limit)
// GET /api/v1/notifications
router.get("/", notificationController.getNotifications);

// 2. Đánh dấu một/nhiều thông báo là đã đọc
// PUT /api/v1/notifications/mark-read
router.put("/mark-read", notificationController.markAsRead);

// 3. Đánh dấu TẤT CẢ thông báo là đã đọc
// PUT /api/v1/notifications/mark-all-read
router.put("/mark-all-read", notificationController.markAllAsRead);
router.delete("/", notificationController.deleteAll);

router.post("/test-emit", notificationController.createNotificationTest);

module.exports = router;
