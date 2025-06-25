const express = require('express');
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../../controllers/order/orderController'); // Đảm bảo đường dẫn này đúng

const router = express.Router();

// Route cho việc lấy tất cả đơn hàng và tạo mới đơn hàng
// GET /api/orders        (Lấy tất cả)
// POST /api/orders       (Tạo mới)
router.route('/')
    .get(getAllOrders)
    .post(createOrder);

// Route cho việc thao tác với một đơn hàng cụ thể theo ID
// GET /api/orders/:id    (Lấy theo ID)
// PUT /api/orders/:id    (Cập nhật theo ID)
// DELETE /api/orders/:id (Xóa theo ID)
router.route('/:id')
    .get(getOrderById)
    .put(updateOrder)
    .delete(deleteOrder);

module.exports = router;