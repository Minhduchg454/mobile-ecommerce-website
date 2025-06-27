const router = require('express').Router();
const ctrls = require('../../controllers/user/addressController');

// Tạo mới địa chỉ
router.post('/', ctrls.createAddress); // POST /api/address

// Lấy danh sách địa chỉ theo userId
router.get('/', ctrls.getAddressesByUser); // GET /api/address?userId=...

// Cập nhật địa chỉ
router.put('/:id', ctrls.updateAddress); // PUT /api/address/:id

// Xóa địa chỉ
router.delete('/:id', ctrls.deleteAddress); // DELETE /api/address/:id

// Lấy chi tiết address theo id
router.get('/:id', ctrls.getAddressById); // GET /api/address/:id

module.exports = router; 