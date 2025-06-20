const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order/orderController');

// Import middleware xác thực/phân quyền nếu bạn có
// const { protect, authorize } = require('../middleware/authMiddleware');

// Routes cho Order
router.route('/')
    .post(orderController.createOrder) // Có thể thêm protect, authorize cho customer/user
    .get(orderController.getAllOrders); // Có thể thêm protect, authorize cho admin

router.route('/:id')
    .get(orderController.getOrderById) // Có thể thêm protect, authorize cho admin hoặc customer sở hữu
    .put(orderController.updateOrder) // Có thể thêm protect, authorize cho admin
    .delete(orderController.deleteOrder); // Có thể thêm protect, authorize cho admin

router.patch('/:id/status', orderController.updateOrderStatus); // Chỉ admin mới được cập nhật trạng thái

module.exports = router;