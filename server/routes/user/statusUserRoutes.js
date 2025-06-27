const router = require('express').Router();
const ctrls = require('../../controllers/user/statusUserController');

// Tạo mới trạng thái user
router.post('/', ctrls.createStatusUser); // POST /api/statususer

// Lấy danh sách tất cả trạng thái user
router.get('/', ctrls.getStatusUsers); // GET /api/statususer

// Cập nhật trạng thái user
router.put('/:id', ctrls.updateStatusUser); // PUT /api/statususer/:id

// Xóa trạng thái user
router.delete('/:id', ctrls.deleteStatusUser); // DELETE /api/statususer/:id

module.exports = router; 