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
    const {
      _id,
      status,
      customerId,
      paymentMethod,
      fromDate,
      toDate,
      sortByDate, // ✅ thêm tham số mới
    } = req.query;

    const filter = {};

    // Lọc theo trạng thái
    if (status) filter.status = status;

    // Loc theo id đơn hàng
    if (_id) filter._id = _id;

    // Lọc theo khách hàng
    if (customerId) filter.customerId = customerId;

    // Lọc theo phương thức thanh toán
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Lọc theo khoảng ngày tạo
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // Xác định sắp xếp theo createdAt
    const sortOption = {};
    if (sortByDate === "asc") sortOption.createdAt = 1;
    else sortOption.createdAt = -1; // mặc định là mới nhất

    const orders = await Order.find(filter)
      .populate("shippingAddress")
      .populate("shippingProviderId")
      .populate({
        path: "customerId",
        populate: {
          path: "_id",
          model: "User",
          select: "firstName lastName email avatar mobile roleId statusUserId",
        },
      })
      .sort(sortOption); // ✅ sắp xếp theo ngày

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
        path: "customerId",
        populate: {
          path: "_id",
          model: "User",
          select: "firstName lastName email avatar mobile roleId statusUserId",
        },
      })
      .populate({
        path: "orderDetails",
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

    const { status, page = 1, limit = 10, _id } = req.query;

    const queryFilter = { customerId: userId };
    if (status) queryFilter.status = status;
    if (_id) queryFilter._id = _id;

    const orders = await Order.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(+limit)
      .lean();

    const orderIds = orders.map((o) => o._id);

    const orderDetails = await OrderDetail.find({
      orderId: { $in: orderIds },
    })
      .populate({
        path: "productVariationId",
        select: "productVariationName images price productId",
        populate: {
          path: "productId",
          select: "productName slug",
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
    const {
      shippingAddress,
      shippingProviderId,
      customerId,
      orderDetails,
      status,
    } = req.body;

    // 1. Tìm Order
    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, mes: "Không tìm thấy đơn hàng." });
    }

    // 2. Cập nhật các trường nếu có
    if (shippingAddress !== undefined) order.shippingAddress = shippingAddress;
    if (shippingProviderId !== undefined)
      order.shippingProviderId = shippingProviderId;
    if (customerId !== undefined) order.customerId = customerId;
    if (status !== undefined) order.status = status;

    await order.save();

    // 3. Nếu có orderDetails và là mảng thì mới xử lý
    if (Array.isArray(orderDetails)) {
      // Lấy danh sách order detail cũ
      const existingDetails = await OrderDetail.find({ orderId: order._id });
      const existingDetailMap = new Map(
        existingDetails.map((d) => [d._id.toString(), d])
      );

      const sentDetailIds = new Set();

      for (const detail of orderDetails) {
        if (detail._id) {
          const existing = existingDetailMap.get(detail._id);
          if (existing) {
            if (detail.productVariationId !== undefined)
              existing.productVariationId = detail.productVariationId;
            if (detail.quantity !== undefined)
              existing.quantity = detail.quantity;
            await existing.save();
            sentDetailIds.add(detail._id);
          }
        } else {
          // Nếu là mới => tạo mới
          const newDetail = new OrderDetail({
            orderId: order._id,
            productVariationId: detail.productVariationId,
            quantity: detail.quantity,
            price: 0, // có thể cập nhật logic tính giá ở đây nếu cần
          });
          await newDetail.save();
        }
      }

      // Xóa các OrderDetail không còn tồn tại trong danh sách gửi lên
      for (const existing of existingDetails) {
        if (!sentDetailIds.has(existing._id.toString())) {
          await existing.deleteOne();
        }
      }
    }

    // 4. Trả kết quả
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

    return res.status(200).json({
      success: true,
      mes: "Xóa thành công",
    });
  } catch (err) {
    next(err);
  }
};
