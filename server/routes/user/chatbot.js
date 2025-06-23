const router = require('express').Router();
const ctrls = require('../controllers/chatbot');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');

// Lấy cấu hình chatbot
router.get('/', ctrls.getConfig);

// Cập nhật cấu hình chatbot (chỉ admin)
router.put('/', [verifyAccessToken, isAdmin], ctrls.updateConfig);

// Bật/tắt chatbot (chỉ admin)
router.put('/toggle', [verifyAccessToken, isAdmin], ctrls.toggleActive);

// Xử lý tin nhắn từ người dùng
router.post('/message', ctrls.handleMessage);

module.exports = router; 