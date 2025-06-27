const router = require('express').Router();
const ctrls = require('../../controllers/user/previewController');

// Tạo mới Preview
router.post('/', ctrls.createPreview); // POST /api/preview

// Lấy danh sách Preview theo userId
router.get('/', ctrls.getPreviews); // GET /api/preview?userId=...

// Cập nhật Preview
router.put('/:id', ctrls.updatePreview); // PUT /api/preview/:id

// Xóa Preview
router.delete('/:id', ctrls.deletePreview); // DELETE /api/preview/:id

module.exports = router; 