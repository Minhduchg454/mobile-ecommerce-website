const router = require('express').Router();
const ctrls = require('../../controllers/user/shoppingCartController');

// Tạo mới giỏ hàng
router.post('/', ctrls.createCart); // POST /api/shoppingcart

// Lấy thông tin giỏ hàng theo id
router.get('/:id', ctrls.getCart); // GET /api/shoppingcart/:id

// Cập nhật giỏ hàng
router.put('/:id', ctrls.updateCart); // PUT /api/shoppingcart/:id

// Xóa giỏ hàng
router.delete('/:id', ctrls.deleteCart); // DELETE /api/shoppingcart/:id

module.exports = router; 