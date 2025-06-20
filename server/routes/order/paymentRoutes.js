const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/order/paymentController');

// Import middleware xác thực/phân quyền nếu bạn có
// const { protect, authorize } = require('../middleware/authMiddleware');

// Routes cho Payment
router.route('/')
    .post(paymentController.createPayment) // protect, authorize roles: 'asssdmin', 'user' (nếu user tự tạo payment)
    .get(paymentController.getAllPayments); // protect, authorize roles: 'admin'

router.route('/:id')
    .get(paymentController.getPaymentById) // protect, authorize roles: 'admin', 'user' (nếu là payment của user đó)
    .put(paymentController.updatePayment) // protect, authorize roles: 'admin'
    .delete(paymentController.deletePayment); // protect, authorize roles: 'admin'

router.patch('/:id/status', paymentController.updatePaymentStatus); // protect, authorize roles: 'admin', 'webhook' (internal)

module.exports = router;