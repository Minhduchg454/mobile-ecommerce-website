// controllers/orderController.js
const Order = require("../../models/order/Order");
const mongoose = require("mongoose"); // Import mongoose để kiểm tra ObjectId

// Import các models liên quan để kiểm tra sự tồn tại của ID
const Address = require("../../models/user/Address"); // Cần model Address
const ShippingProvider = require("../../models/order/ShippingProvider");
const OrderDetail = require("../../models/order/OrderDetail");
const ProductVariation = require("../../models/product/ProductVariation");
const Product = require("../../models/product/Product");

// @desc    Lấy tất cả các đơn hàng
// @route   GET /api/orders
// @access  Public
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("shippingAddress")
      .populate("shippingProviderId")
      .populate("customerId");
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
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
        path: "customerId", // lấy thêm thông tin khách hàng
        select: "firstName lastName email mobile avatar", // chọn các trường cần
      })
      .populate({
        path: "orderDetails", // lấy danh sách chi tiết đơn hàng
        populate: {
          path: "productVariationId",
          select: "productVariationName price images",
        },
      })
      .populate({
        path: "shippingProviderId",
        select: "providerName",
      })
      .populate({
        path: "shippingAddress",
        select: "street ward district country",
      });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .lean(); // `.lean()` cho kết quả nhẹ và dễ xử lý hơn

    const orderIds = orders.map((o) => o._id);

    const orderDetails = await OrderDetail.find({
      orderId: { $in: orderIds },
    })
      .populate({
        path: "productVariationId",
        select: "productVariationName images price productId",
        populate: {
          path: "productId",
          select: "name slug",
        },
      })
      .lean();

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((d) => d.orderId.equals(order._id));
      return {
        ...order,
        items: details,
      };
    });
    console.log({ success: true, orders: ordersWithDetails });
    res.status(200).json({ success: true, orders: ordersWithDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đơn hàng",
    });
  }
};

// @desc    Tạo một đơn hàng mới
// @route   POST /api/orders
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.createOrder = async (req, res, next) => {
  //   console.log(req.body);
  try {
    const { products, total, address, appliedCoupon, paymentMethod, status } =
      req.body;
    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Không có sản phẩm" });
    }

    // 1. Tạo đơn hàng chính
    const newOrder = new Order({
      shippingAddress: address,
      shippingProviderId: null, // nếu có thể, thêm provider sau
      customerId: req.user.id || null, // hoặc từ token nếu có
      totalPrice: total,
      paymentMethod,
      appliedCoupon,
      status,
    });

    const savedOrder = await newOrder.save();

    // 2. Tạo các chi tiết đơn hàng (OrderDetail)
    for (const item of products) {
      const variation = await ProductVariation.findById(
        item.productVariationId
      );
      if (!variation) {
        throw new Error(
          `Không tìm thấy sản phẩm với ID: ${item.productVariationId}`
        );
      }
      if (variation.stockQuantity < item.quantity) {
        throw new Error(
          `Sản phẩm ${variation.productVariationName} không đủ tồn kho.`
        );
      }
      variation.stockQuantity -= item.quantity;
      variation.sold += item.quantity;
      await variation.save();
      const newDetail = new OrderDetail({
        productVariationId: item.productVariationId,
        quantity: item.quantity,
        price: item.price,
        orderId: savedOrder._id,
      });
      await newDetail.save();
    }

    res.status(201).json({
      success: true,
      data: {
        order: savedOrder,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// @desc    Cập nhật một đơn hàng
// @route   PUT /api/orders/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
// controllers/orderController.js
exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shippingAddress, shippingProviderId, customerId, orderDetails } =
      req.body;

    // 1. Tìm Order cần update
    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, mes: "Không tìm thấy đơn hàng." });
    }

    // 2. Cập nhật thông tin đơn hàng
    order.shippingAddress = shippingAddress || order.shippingAddress;
    order.shippingProviderId = shippingProviderId || order.shippingProviderId;
    order.customerId = customerId || order.customerId;
    order.status = "Pending";
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
            price: 0, // tạm thời cho là 0
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
      return res
        .status(400)
        .json({ success: false, mes: "Danh sách sản phẩm không được trống." });
    }

    // 5. Trả kết quả thành công
    res.status(200).json({
      success: true,
      data: {
        message: "Cập nhật đơn hàng thành công.",
        orderId: order._id,
      },
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng để xóa." });
    }

    // 2. Xóa chi tiết đơn hàng
    await OrderDetail.deleteMany({ orderId });

    res.status(204).json({
      status: "success",
      mess: "Đã xóa thành công",
    });
  } catch (err) {
    next(err);
  }
};
