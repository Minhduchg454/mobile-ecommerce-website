// routes/user/__user.js
// Định nghĩa các route liên quan đến User
const router = require('express').Router();
const ctrls = require('../../controllers/user/user____');
const { verifyAccessToken, isAdmin } = require('../../middlewares/verifyToken');

// Đăng ký tài khoản mới
router.post('/register', ctrls.register); // POST /api/user/register

// Đăng nhập
router.post('/login', ctrls.login); // POST /api/user/login

// Lấy thông tin user hiện tại (yêu cầu xác thực)
router.get('/current', verifyAccessToken, ctrls.getCurrent); // GET /api/user/current

// Cập nhật thông tin user (yêu cầu xác thực)
router.put('/current', verifyAccessToken, ctrls.updateUser); // PUT /api/user/current

// Xóa user (chỉ admin)
router.delete('/:uid', [verifyAccessToken, isAdmin], ctrls.deleteUser); // DELETE /api/user/:uid

// Lấy danh sách tất cả user (chỉ admin)
router.get('/', [verifyAccessToken, isAdmin], ctrls.getUsers); // GET /api/user/

// Xuất router
module.exports = router;

// // CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETEeee
// // CREATE (POST) + PUT - body
// // GET + DELETE - query // ?fdfdsf&fdfs
