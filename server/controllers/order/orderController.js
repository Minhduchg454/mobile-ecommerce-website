// controllers/orderController.js
const Order = require('../../models/order/Order');
const mongoose = require('mongoose'); // Import mongoose để kiểm tra ObjectId

// Import các models liên quan để kiểm tra sự tồn tại của ID
const Address = require('../../models/user/Address'); // Cần model Address
const ShippingProvider = require('../../models/order/ShippingProvider');
const Customer = require('../../models/user/Customer'); // Cần model Customer
const OrderDetail = require('../../models/order/OrderDetail')
// @desc    Lấy tất cả các đơn hàng
// @route   GET /api/orders
// @access  Public
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('shippingAddress')
            .populate('shippingProviderId')
            .populate('customerId');
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Lấy một đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Public
// controllers/orderController.js
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'customerId', // lấy thêm thông tin khách hàng
                select: 'firstName lastName email mobile avatar' // chọn các trường cần
            })
            .populate({
                path: 'orderDetails', // lấy danh sách chi tiết đơn hàng
                populate: {
                    path: 'productVariationId',
                    select: 'productVariationName price images'
                }
            })
            .populate({
                path: 'shippingProviderId',
                select: 'providerName'
            })
            .populate({
                path: 'shippingAddress',
                select: 'street ward district country'
            }
            )

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Tạo một đơn hàng mới
// @route   POST /api/orders
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.createOrder = async (req, res, next) => {
    try {
        // 1. Tạo Order chính trước
        const { shippingAddress, shippingProviderId, customerId, orderDetails } = req.body;

        const newOrder = new Order({
            shippingAddress,
            shippingProviderId,
            customerId,
            totalPrice: 0 // cho tạm bằng 0
        });
        const savedOrder = await newOrder.save();
        // 2. Tạo các OrderDetail liên quan
        if (orderDetails && orderDetails.length > 0) {
            try {
                for (const detail of orderDetails) {
                    const newDetail = new OrderDetail({
                        ...detail,
                        orderId: savedOrder._id,
                        price: 0 // tạm thời cho là 0
                    });
                    await newDetail.save(); // Sử dụng middleware pre('save') ở đây
                }
            } catch (err) {
                await newOrder.deleteOne(); // rollback lại đơn hàng
                return next(err);
            }
        } else {
            return new Error("Không có danh mục sản phẩm nào được chọn")
        }

        res.status(201).json({
            status: 'success',
            data: {
                order: savedOrder,
                // Bạn có thể fetch lại các order details để trả về đầy đủ
            }
        });

    } catch (err) {
        next(err); // Chuyển lỗi cho middleware xử lý lỗi
    }
};

// @desc    Cập nhật một đơn hàng
// @route   PUT /api/orders/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
// controllers/orderController.js
exports.updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { shippingAddress, shippingProviderId, customerId, orderDetails } = req.body;

        // 1. Tìm Order cần update
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, mes: 'Không tìm thấy đơn hàng.' });
        }

        // 2. Cập nhật thông tin đơn hàng
        order.shippingAddress = shippingAddress || order.shippingAddress;
        order.shippingProviderId = shippingProviderId || order.shippingProviderId;
        order.customerId = customerId || order.customerId;
        order.totalPrice = 0 // cho tạm bằng 0
        order.status = "Pending"
        await order.save();

        // 3. Xóa tất cả các OrderDetail cũ
        await OrderDetail.deleteMany({ orderId: order._id });

        // 4. Tạo lại các OrderDetail mới (dùng vòng lặp)
        if (orderDetails && orderDetails.length > 0) {
            const createdDetails = [];
            try {
                for (const detail of orderDetails) {
                    const newDetail = new OrderDetail({
                        ...detail,
                        orderId: order._id,
                        price: 0 // tạm thời cho là 0
                    });
                    const savedDetail = await newDetail.save(); // sẽ kích hoạt pre('save')
                    createdDetails.push(savedDetail);
                }
            } catch (err) {
                // rollback nếu lỗi: xóa order detail mới và giữ lại đơn hàng cũ
                for (const d of createdDetails) {
                    await d.deleteOne();
                }
                return next(err);
            }
        } else {
            return res.status(400).json({ success: false, mes: 'Danh sách sản phẩm không được trống.' });
        }

        // 5. Trả kết quả thành công
        res.status(200).json({
            success: true,
            data: {
                message: 'Cập nhật đơn hàng thành công.',
                orderId: order._id
            }
        });
    } catch (err) {
        next(err);
    }
};


// @desc    Xóa một đơn hàng
// @route   DELETE /api/orders/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
// controllers/orderController.js
exports.deleteOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;

        // 1. Xóa đơn hàng
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa.' });
        }

        // 2. Xóa chi tiết đơn hàng
        await OrderDetail.deleteMany({ orderId });

        res.status(204).json({
            status: 'success',
            mess: "Đã xóa thành công"
        });
    } catch (err) {
        next(err);
    }
};
