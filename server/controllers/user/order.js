// controllers/user/order.js
// Controller xử lý các chức năng liên quan đến Order của User/Customer
const Order = require('../../models/order/Order');
const OrderDetail = require('../../models/order/OrderDetail');
const Customer = require('../../models/user/Customer');
const asyncHandler = require('express-async-handler');

// Tạo đơn hàng mới cho Customer
const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user; // Lấy id user từ middleware xác thực
    const { orderDetails, totalPrice, address, status } = req.body;
    // Kiểm tra đầu vào
    if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0 || !totalPrice || !address) {
        return res.status(400).json({ success: false, mes: 'Missing order information' });
    }
    // Tạo đơn hàng
    const newOrder = await Order.create({
        customerId: _id,
        totalPrice,
        address,
        status
    });
    // Tạo chi tiết đơn hàng cho từng sản phẩm
    for (const item of orderDetails) {
        await OrderDetail.create({
            orderId: newOrder._id,
            productVariationId: item.productVariationId,
            quantity: item.quantity,
            price: item.price
        });
    }
    return res.status(201).json({ success: true, order: newOrder });
});

// Lấy danh sách đơn hàng của user hiện tại
const getUserOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const orders = await Order.find({ customerId: _id }).populate('customerId');
    return res.json({ success: true, orders });
});

// Lấy chi tiết một đơn hàng (theo id, chỉ cho phép user xem đơn của mình)
const getOrderDetail = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, customerId: _id });
    if (!order) return res.status(404).json({ success: false, mes: 'Order not found' });
    const details = await OrderDetail.find({ orderId: order._id });
    return res.json({ success: true, order, details });
});

// Cập nhật trạng thái đơn hàng (chỉ admin hoặc chủ đơn hàng)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, mes: 'Missing status' });
    const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    return res.json({ success: !!updated, order: updated || 'Update failed' });
});

// Xóa đơn hàng (chỉ admin hoặc chủ đơn hàng)
const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    await OrderDetail.deleteMany({ orderId }); // Xóa luôn chi tiết đơn hàng
    return res.json({ success: !!deleted, mes: deleted ? 'Order deleted' : 'Delete failed' });
});

// Xuất các hàm controller
module.exports = {
    createOrder, // Tạo đơn hàng
    getUserOrders, // Lấy danh sách đơn hàng của user
    getOrderDetail, // Lấy chi tiết đơn hàng
    updateOrderStatus, // Cập nhật trạng thái đơn hàng
    deleteOrder // Xóa đơn hàng
};
