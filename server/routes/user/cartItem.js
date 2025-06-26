const router = require('express').Router();
const ctrls = require('../../controllers/user/cartItemController');

// Tạo mới CartItem
router.post('/', ctrls.createCartItem); // POST /api/cartitem

// Lấy danh sách CartItem theo shoppingCart
router.get('/', ctrls.getCartItems); // GET /api/cartitem?shoppingCart=...

// Cập nhật CartItem
router.put('/:id', ctrls.updateCartItem); // PUT /api/cartitem/:id

// Xóa CartItem
router.delete('/:id', ctrls.deleteCartItem); // DELETE /api/cartitem/:id

module.exports = router; 