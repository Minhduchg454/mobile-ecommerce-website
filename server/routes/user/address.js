const router = require('express').Router();
const ctrls = require('../../controllers/user/addressController');

// Tạo mới địa chỉ
router.post('/', ctrls.createAddress); // POST /api/address

// Lấy danh sách địa chỉ theo userId
router.get('/', ctrls.getAddresses); // GET /api/address?userId=...

// Cập nhật địa chỉ
router.put('/:id', ctrls.updateAddress); // PUT /api/address/:id

// Xóa địa chỉ
router.delete('/:id', ctrls.deleteAddress); // DELETE /api/address/:id

module.exports = router; 