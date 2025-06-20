const Order = require('../../models/order/Order');
const Address = require('../../models/user/Address'); // Cần import để populate hoặc kiểm tra
const Payment = require('../../models/order/Payment'); // Cần import để populate hoặc kiểm tra
const ShippingProvider = require('../../models/order/ShippingProvider'); // Cần import để populate hoặc kiểm tra
const Customer = require('../../models/user/Customer'); // Cần import để populate hoặc kiểm tra

// @desc    Tạo một đơn hàng mới
// @route   POST /api/orders
// @access  Private (có thể là Customer hoặc Admin)
const createOrder = async (req, res) => {
    try {
        const { totalPrice, status, shippingAddress, payment, shippingProvider, customer } = req.body;

        // Kiểm tra xem các ID tham chiếu có tồn tại không (tùy chọn nhưng nên làm)
        const existingAddress = await Address.findById(shippingAddress);
        if (!existingAddress) {
            return res.status(404).json({ message: 'Shipping Address not found.' });
        }
        const existingPayment = await Payment.findById(payment);
        if (!existingPayment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        const existingShippingProvider = await ShippingProvider.findById(shippingProvider);
        if (!existingShippingProvider) {
            return res.status(404).json({ message: 'Shipping Provider not found.' });
        }
        const existingCustomer = await Customer.findById(customer);
        if (!existingCustomer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        const newOrder = new Order({
            totalPrice,
            status,
            shippingAddress,
            payment,
            shippingProvider,
            customer
            // orderDate sẽ tự động được điền
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả các đơn hàng
// @route   GET /api/orders
// @access  Private (chỉ Admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('shippingAddress') // Lấy thông tin địa chỉ
            .populate('payment')         // Lấy thông tin thanh toán
            .populate('shippingProvider') // Lấy thông tin nhà vận chuyển
            .populate('customer', 'email firstName lastName'); // Lấy thông tin khách hàng (chỉ các trường cần thiết)

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy một đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private (Admin hoặc Customer sở hữu đơn hàng)
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('shippingAddress')
            .populate('payment')
            .populate('shippingProvider')
            .populate('customer', 'email firstName lastName');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật một đơn hàng theo ID
// @route   PUT /api/orders/:id
// @access  Private (chỉ Admin)
const updateOrder = async (req, res) => {
    try {
        const { totalPrice, status, shippingAddress, payment, shippingProvider, customer } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { totalPrice, status, shippingAddress, payment, shippingProvider, customer },
            { new: true, runValidators: true } // `new: true` trả về document đã cập nhật, `runValidators: true` chạy các validator trong schema
        )
            .populate('shippingAddress')
            .populate('payment')
            .populate('shippingProvider')
            .populate('customer', 'email firstName lastName');

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PATCH /api/orders/:id/status
// @access  Private (chỉ Admin hoặc hệ thống tự động)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !Order.schema.path('status').enumValues.includes(status)) {
            return res.status(400).json({ message: 'Invalid or missing status.' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true, runValidators: true }
        )
            .populate('customer', 'email firstName lastName'); // Lấy thông tin khách hàng để trả về

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Xóa một đơn hàng
// @route   DELETE /api/orders/:id
// @access  Private (chỉ Admin)
const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
};