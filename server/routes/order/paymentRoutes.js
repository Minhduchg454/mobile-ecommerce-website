// routes/payments.js
const express = require('express');
const {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
} = require('../../controllers/order/paymentController'); // Đảm bảo đường dẫn này đúng

const router = express.Router();

// Route cho việc lấy tất cả thanh toán và tạo mới thanh toán
// GET /api/payments        (Lấy tất cả)
// POST /api/payments       (Tạo mới)
router.route('/')
    .get(getAllPayments)
    .post(createPayment);

// Route cho việc thao tác với một thanh toán cụ thể theo ID
// GET /api/payments/:id    (Lấy theo ID)
// PUT /api/payments/:id    (Cập nhật theo ID)
// DELETE /api/payments/:id (Xóa theo ID)
router.route('/:id')
    .get(getPaymentById)
    .put(updatePayment)
    .delete(deletePayment);

module.exports = router;