const router = require('express').Router();
const ctrls = require('../../controllers/user/adminController');
const { verifyAccessToken, isAdmin } = require('../../middlewares/verifyToken');

// Đăng ký admin mới
router.post('/register', verifyAccessToken, isAdmin, ctrls.register); // Chỉ admin mới được tạo admin mới

// Lấy thông tin admin hiện tại
router.get('/current', verifyAccessToken, ctrls.getCurrent); // Admin tự xem thông tin của mình

// Cập nhật thông tin admin hiện tại
router.put('/current', verifyAccessToken, ctrls.updateAdmin); // Admin tự cập nhật thông tin của mình

// Xóa admin (chỉ admin khác mới được xóa)
router.delete('/:aid', verifyAccessToken, isAdmin, ctrls.deleteAdmin); // Chỉ admin mới được xóa admin khác

module.exports = router; 