// controllers/paymentController.js
const Payment = require("../../models/order/Payment");
const mongoose = require("mongoose"); // Import mongoose để kiểm tra ObjectId

// @desc    Lấy tất cả các giao dịch thanh toán
// @route   GET /api/payments
// @access  Public
exports.getAllPayments = async (req, res) => {
  try {
    // Có thể thêm populate('orderId') nếu muốn hiển thị thông tin Order liên quan
    const payments = await Payment.find().populate("orderId");
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Lấy một giao dịch thanh toán theo ID
// @route   GET /api/payments/:id
// @access  Public
exports.getPaymentById = async (req, res) => {
  try {
    // Kiểm tra xem ID có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID thanh toán không hợp lệ",
      });
    }

    const payment = await Payment.findById(req.params.id).populate("orderId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy giao dịch thanh toán",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Tạo một giao dịch thanh toán mới
// @route   POST /api/payments
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.createPayment = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, amount, orderId } = req.body;

    // Kiểm tra xem orderId có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: "orderId không hợp lệ",
      });
    }

    // Trong một ứng dụng thực tế, bạn có thể muốn kiểm tra xem orderId này có tồn tại trong database không
    // const Order = require('../models/Order'); // Cần import model Order
    // const existingOrder = await Order.findById(orderId);
    // if (!existingOrder) {
    //     return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng với orderId đã cho' });
    // }

    const newPayment = await Payment.create({
      paymentStatus,
      paymentMethod,
      amount,
      orderId,
    });

    res.status(201).json({
      success: true,
      data: newPayment,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Cập nhật một giao dịch thanh toán
// @route   PUT /api/payments/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.updatePayment = async (req, res) => {
  try {
    // Kiểm tra xem ID có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID thanh toán không hợp lệ",
      });
    }

    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy giao dịch thanh toán",
      });
    }

    // Nếu có orderId mới trong request body, kiểm tra tính hợp lệ của nó
    if (
      req.body.orderId &&
      !mongoose.Types.ObjectId.isValid(req.body.orderId)
    ) {
      return res.status(400).json({
        success: false,
        error: "orderId mới không hợp lệ",
      });
    }

    payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Trả về tài liệu đã cập nhật
      runValidators: true, // Chạy lại các trình xác thực schema
    });

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Xóa một giao dịch thanh toán
// @route   DELETE /api/payments/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.deletePayment = async (req, res) => {
  try {
    // Kiểm tra xem ID có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID thanh toán không hợp lệ",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy giao dịch thanh toán",
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
