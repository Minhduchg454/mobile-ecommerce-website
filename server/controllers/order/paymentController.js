const Payment = require('../../models/order/Payment'); // Đảm bảo đường dẫn đúng

// @desc    Tạo một bản ghi thanh toán mới
// @route   POST /api/payments
// @access  Private (có thể là Admin hoặc một quy trình tạo đơn hàng/thanh toán)
const createPayment = async (req, res) => {
    try {
        const { paymentStatus, paymentMethod, amount } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!paymentMethod || !amount) {
            return res.status(400).json({ message: 'Payment method and amount are required.' });
        }

        // Tạo đối tượng Payment mới
        const newPayment = new Payment({
            paymentStatus,      // Sẽ dùng default 'Pending' nếu không được cung cấp
            paymentMethod,
            amount
            // paymentDate sẽ tự động điền
        });

        const savedPayment = await newPayment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        // Xử lý lỗi trùng lặp, lỗi validate, v.v.
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả các bản ghi thanh toán
// @route   GET /api/payments
// @access  Private (chỉ Admin)
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({}); // Lấy tất cả các bản ghi thanh toán
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy một bản ghi thanh toán theo ID
// @route   GET /api/payments/:id
// @access  Private (Admin hoặc người dùng có liên quan đến payment này)
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật một bản ghi thanh toán theo ID
// @route   PUT /api/payments/:id
// @access  Private (chỉ Admin)
const updatePayment = async (req, res) => {
    try {
        const { paymentStatus, paymentMethod, amount } = req.body;

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            { paymentStatus, paymentMethod, amount },
            { new: true, runValidators: true } // `new: true` trả về document đã cập nhật, `runValidators: true` chạy các validator trong schema
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }
        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật trạng thái thanh toán (thường được gọi khi có webhook từ cổng thanh toán)
// @route   PATCH /api/payments/:id/status
// @access  Private (Admin hoặc Webhook của cổng thanh toán)
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        // Kiểm tra xem trạng thái mới có hợp lệ không
        if (!paymentStatus || !Payment.schema.path('paymentStatus').enumValues.includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid or missing payment status.' });
        }

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: paymentStatus },
            { new: true, runValidators: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }
        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa một bản ghi thanh toán
// @route   DELETE /api/payments/:id
// @access  Private (chỉ Admin)
const deletePayment = async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);

        if (!deletedPayment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }
        res.status(200).json({ message: 'Payment record deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    updatePaymentStatus,
    deletePayment,
};