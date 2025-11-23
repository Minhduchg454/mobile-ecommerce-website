// services/order.service.js
const mongoose = require("mongoose");
const Order = require("./entities/order.model");
const OrderDetail = require("./entities/order-detail.model");
const OrderStatus = require("./entities/order-status.model");
const paymentService = require("../payment/payment.service");
const productService = require("../product/product.service");
const couponService = require("../coupon/coupon.service");
const previewService = require("../preview/preview.service");
const notificationServer = require("../notification/notification.service");

/**
 * Helper: đảm bảo có OrderStatus theo tên, trả về _id (KHÔNG dùng session)
 */
async function ensureOrderStatusByName(name) {
  const allowed = [
    "Pending",
    "Confirmed",
    "Shipping",
    "Succeeded",
    "Cancelled",
    "Delivered",
  ];
  if (!allowed.includes(name))
    throw new Error(`orderStatus không hợp lệ: ${name}`);

  const doc = await OrderStatus.findOneAndUpdate(
    { orderStatusName: name },
    { $setOnInsert: { orderStatusName: name } },
    { new: true, upsert: true }
  ).lean();
  return doc._id;
}

/**
 * Helper: chốt tổng tiền 1 đơn (mỗi shop) ở server
 */
function computeLineTotal({
  shopSubtotal = 0,
  shippingFee = 0,
  shippingDiscount = 0,
  shopDiscount = 0,
  systemDiscount = 0,
}) {
  const _shopSubtotal = Math.max(0, Number(shopSubtotal) || 0);
  const _shippingFee = Math.max(0, Number(shippingFee) || 0);
  const _shippingDiscount = Math.max(0, Number(shippingDiscount) || 0);
  const _shopDiscount = Math.max(0, Number(shopDiscount) || 0);
  const _systemDiscount = Math.max(0, Number(systemDiscount) || 0);

  const cappedShipDiscount = Math.min(_shippingDiscount, _shippingFee);
  const cappedItemDiscount = Math.min(
    _shopDiscount + _systemDiscount,
    _shopSubtotal
  );

  const line =
    _shopSubtotal + _shippingFee - cappedShipDiscount - cappedItemDiscount;
  return Math.max(0, Math.round(line));
}

function buildSort(sortStr) {
  // ví dụ: sort=-createdAt,orderTotalPrice
  if (!sortStr) return { createdAt: -1 };
  const sort = {};
  sortStr.split(",").forEach((f) => {
    f = f.trim();
    if (!f) return;
    if (f.startsWith("-")) sort[f.slice(1)] = -1;
    else sort[f] = 1;
  });
  return sort;
}

async function buildCommonFilter(q = {}) {
  const filter = {};

  // tổng tiền
  if (q.minTotal || q.maxTotal) {
    filter.orderTotalPrice = {};
    if (q.minTotal) filter.orderTotalPrice.$gte = Number(q.minTotal);
    if (q.maxTotal) filter.orderTotalPrice.$lte = Number(q.maxTotal);
  }

  // ngày tạo
  if (q.from || q.to) {
    filter.createdAt = {};
    if (q.from) filter.createdAt.$gte = new Date(q.from);
    if (q.to) filter.createdAt.$lte = new Date(q.to);
  }

  // phương thức thanh toán
  if (q.paymentMethod) {
    filter.paymentMethod = q.paymentMethod;
  }

  // shopId
  if (q.shopId && mongoose.isValidObjectId(q.shopId)) {
    filter.shopId = q.shopId;
  }

  if (q.orderId) {
    filter._id = q.orderId;
  }

  //  trạng thái đơn hàng (orderStatusId hoặc orderStatusName)
  if (q.orderStatusId && mongoose.isValidObjectId(q.orderStatusId)) {
    filter.orderStatusId = q.orderStatusId;
  } else if (q.orderStatusName) {
    const status = await OrderStatus.findOne({
      orderStatusName: q.orderStatusName,
    }).lean();
    if (status) filter.orderStatusId = status._id;
    else {
      filter.orderStatusId = "__not_found__";
    }
  }
  return filter;
}

// Gắn đơn hàng với chi tiết đơn hàng
async function attachOrderDetails(orders) {
  if (!orders.length) return orders;

  const orderIds = orders.map((o) => o._id);
  const customerId = orders[0]?.addressId?.userId || null;

  // 1. Lấy OrderDetail + populate pvId + productId
  const details = await OrderDetail.find({ orderId: { $in: orderIds } })
    .populate({
      path: "pvId",
      select: "pvName pvImages pvPrice productId pvOriginalPrice",
      populate: {
        path: "productId",
        select: "productName productDiscountPercent",
      },
    })
    .lean();

  // 2. Thu thập tất cả pvId duy nhất từ OrderDetail
  const pvIds = [
    ...new Set(details.map((d) => d.pvId?._id || d.pvId).filter(Boolean)),
  ];

  // 3. Gọi getPreview MỘT LẦN với mảng orderId + pvId + customerId
  let previewsMap = new Map(); // key: `${orderId}|${pvId}` → preview
  if (customerId && orderIds.length > 0 && pvIds.length > 0) {
    const previewRes = await previewService.getPreview({
      customerId: customerId,
      orderId: orderIds.map(String),
      pvId: pvIds.map(String),
      isDeleted: false,
      limit: 1000,
      page: 1,
    });

    if (previewRes.success && previewRes.previews.length > 0) {
      for (const p of previewRes.previews) {
        const key = `${String(p.orderId)}|${String(p.pvId)}`;
        previewsMap.set(key, p);
      }
    }
  }

  // 4. Group OrderDetail theo orderId
  const orderDetailMap = new Map();

  for (const d of details) {
    const orderIdStr = String(d.orderId);
    if (!orderDetailMap.has(orderIdStr)) {
      orderDetailMap.set(orderIdStr, []);
    }

    const pvIdStr = String(d.pvId?._id || d.pvId);
    const previewKey = `${orderIdStr}|${pvIdStr}`;
    const previewInfo = previewsMap.get(previewKey) || null;

    const item = {
      _id: d._id,
      orderId: d.orderId,
      pvId: d.pvId?._id || d.pvId,
      productVariation: d.pvId || null,
      odQuantity: d.odQuantity,
      odPrice: d.odPrice,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };

    // Chỉ gắn nếu có đánh giá
    if (previewInfo) {
      item.previewInfo = previewInfo;
    }

    orderDetailMap.get(orderIdStr).push(item);
  }

  // 5. Gắn items vào orders
  return orders.map((o) => ({
    ...o,
    items: orderDetailMap.get(String(o._id)) || [],
  }));
}

function getNotificationTemplate(status, orderId) {
  const idStr = orderId.toString().slice(-6).toUpperCase();
  const templates = {
    Pending: {
      title: "Đặt hàng thành công",
      message: `Đơn hàng #${idStr} đang chờ người bán xác nhận. Vui lòng chờ nhé!`,
    },
    Confirmed: {
      title: "Đơn hàng đã được xác nhận",
      message: `Người bán đang chuẩn bị hàng cho đơn #${idStr}. Đơn hàng sẽ sớm được giao đi.`,
    },
    Shipping: {
      title: "Đơn hàng đang được vận chuyển",
      message: `Đơn hàng #${idStr} đã được giao cho đơn vị vận chuyển. Vui lòng chú ý điện thoại bạn nhé.`,
    },
    Delivered: {
      title: "Đơn hàng đã đến nơi",
      message: `Shipper đang đợi bạn nhận đơn hàng #${idStr}. Ra nhận hàng ngay nhé!`,
    },
    Succeeded: {
      title: "Giao hàng thành công",
      message: `Đơn hàng #${idStr} đã được giao thành công. Hãy đánh giá sản phẩm để nhận ưu đãi nhé!`,
    },
    Cancelled: {
      title: "Đơn hàng đã bị hủy",
      message: `Đơn hàng #${idStr} đã bị hủy. Nhấn vào đây để xem chi tiết.`,
    },
  };

  return (
    templates[status] || {
      title: "Cập nhật đơn hàng",
      message: `Đơn hàng #${idStr} vừa cập nhật trạng thái mới: ${status}`,
    }
  );
}

/**
 * Service: TẠO ĐƠN HÀNG THEO TỪNG SHOP (KHÔNG transaction)
 * - Nếu tạo OrderDetail thất bại cho 1 shop => xóa Order của shop đó và ném lỗi để dừng toàn bộ (hoặc tùy bạn đổi hành vi).
 */
exports.createOrder = async (payload = {}, io) => {
  const {
    customerId,
    addressId,
    addressSnapshot,
    paymentMethod,
    orderStatus = "Pending",
    orderTotals,
    groups,
  } = payload;

  if (
    !customerId ||
    !addressId ||
    !Array.isArray(groups) ||
    groups.length === 0
  ) {
    return {
      success: false,
      message: "Thiếu dữ liệu (customerId, addressId, groups).",
    };
  }

  const orderStatusId = await ensureOrderStatusByName(orderStatus);

  const createdOrders = [];
  const createdPayments = [];
  const paymentErrors = [];
  let serverGrandTotal = 0;

  // mapping trạng thái thanh toán mặc định theo phương thức
  const defaultPaymentStatus = (() => {
    switch (paymentMethod || "") {
      case "COD":
        return "Pending";
      case "QR":
        return "Completed";
      case "VNpay":
        return "Completed";
      case "BANK":
        return "Completed";
      default:
        return "Pending";
    }
  })();

  for (const g of groups) {
    const {
      shopId,
      items = [],
      shopSubtotal = 0,
      shippingFee = 0,
      shippingDiscount = 0,
      shopDiscount = 0,
      systemDiscount = 0,
      shopVouchers = [],
      systemVouchers = [],
      systemFreeShipVouchers = [],
    } = g || {};

    if (!shopId) throw new Error("Thiếu shopId trong groups.");
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(`Nhóm shop ${shopId} không có items hợp lệ.`);
    }

    // Chốt tổng theo server
    const orderTotalPrice = computeLineTotal({
      shopSubtotal,
      shippingFee,
      shippingDiscount,
      shopDiscount,
      systemDiscount,
    });

    // 1) Tạo Order
    const orderDoc = await Order.create({
      orderSubtotalPrice: Number(shopSubtotal) || 0,
      orderShippingFee: Number(shippingFee) || 0,
      orderShippingDiscount: Math.min(
        Number(shippingDiscount) || 0,
        Number(shippingFee) || 0
      ),
      orderShopDiscount: Number(shopDiscount) || 0,
      orderSystemDiscount: Number(systemDiscount) || 0,
      orderTotalPrice,
      orderDate: new Date(),
      orderDeliveryDate: null,
      shopId,
      orderStatusId,
      addressId,
      customerId,
    });

    // 2) Tạo OrderDetail (bulk) — nếu fail => xóa Order vừa tạo (rollback cục bộ)
    try {
      const details = items.map((it) => {
        const pvId = it.productVariationId;
        const qty = Math.max(1, Number(it.quantity) || 0);
        const price = Math.max(0, Number(it.unitPrice) || 0);
        if (!pvId)
          throw new Error(
            `Thiếu productVariationId ở 1 item của shop ${shopId}`
          );

        return {
          orderId: orderDoc._id,
          pvId,
          odQuantity: qty,
          odPrice: price,
        };
      });

      if (details.length) {
        await OrderDetail.insertMany(details, { ordered: true });
      }
      //Cap nhat voucher
      const shopVouchers = g.shopVouchers || [];
      const systemVouchers = g.systemVouchers || [];
      const systemFreeShipVouchers = g.systemFreeShipVouchers || [];

      for (const voucher of [
        ...shopVouchers,
        ...systemVouchers,
        ...systemFreeShipVouchers,
      ]) {
        if (voucher.couponCode) {
          try {
            await couponService.useCoupon(voucher.couponCode, 1);
          } catch (err) {
            await Order.deleteOne({ _id: orderDoc._id });
            await OrderDetail.deleteMany({ orderId: orderDoc._id });
            throw new Error(
              `Áp dụng voucher thất bại: ${voucher.couponCode} - ${err.message}`
            );
          }
        }
      }

      //Cap nhat kho
      for (const detail of details) {
        try {
          await productService.sellVariation(detail.pvId, detail.odQuantity);
        } catch (err) {
          await Order.deleteOne({ _id: orderDoc._id });
          await OrderDetail.deleteMany({ orderId: orderDoc._id });
          throw new Error(
            `Trừ kho thất bại cho biến thể ${detail.pvId}: ${err.message}`
          );
        }
      }
    } catch (e) {
      await Order.deleteOne({ _id: orderDoc._id });
      throw e;
    }

    serverGrandTotal += orderTotalPrice;

    try {
      const payRes = await paymentService.createPayment({
        orderId: orderDoc._id,
        paymentMethod,
        paymentAmount: orderTotalPrice,
        paymentStatus: defaultPaymentStatus,
        shopId,
      });

      if (payRes?.success) {
        createdPayments.push({
          orderId: orderDoc._id,
          payment: payRes.payment,
        });
      } else {
        paymentErrors.push({
          orderId: orderDoc._id,
          error: payRes?.message || "Tạo payment thất bại (unknown)",
        });
      }
    } catch (e) {
      paymentErrors.push({
        orderId: orderDoc._id,
        error: e?.message || "Tạo payment thất bại (exception)",
      });
    }

    // --- [MỚI] 4) GỬI THÔNG BÁO (NOTIFICATION) ---
    try {
      const idStr = orderDoc._id.toString().slice(-6).toUpperCase();

      // A. Gửi cho KHÁCH HÀNG (Báo đặt thành công)
      const notiTemplate = getNotificationTemplate(orderStatus, orderDoc._id);

      const customerNotiData = {
        recipientId: customerId.toString(),
        recipientRole: "customer",
        title: notiTemplate.title,
        message: notiTemplate.message,
        type: "ORDER_CREATED",
        sourceId: orderDoc._id,
        sourceModel: "Order",
        metaData: { status: orderStatus },
      };

      notificationServer
        .createNotificationAndEmit(customerNotiData, io)
        .catch((err) => {
          console.error(`[Noti Error] Gửi khách thất bại: ${err.message}`);
        });

      // B. Gửi cho SHOP (Báo có đơn hàng mới)
      const shopNotiData = {
        recipientId: shopId.toString(),
        recipientRole: "shop",
        title: "Bạn có đơn hàng mới!",
        message: `Đơn hàng #${idStr} với giá trị ${orderTotalPrice.toLocaleString(
          "vi-VN"
        )}đ đang chờ xác nhận. Chuẩn bị hàng ngay nhé!`,
        type: "ORDER_CREATED",
        sourceId: orderDoc._id,
        sourceModel: "Order",
        metaData: { status: "Pending" },
      };

      notificationServer
        .createNotificationAndEmit(shopNotiData, io)
        .catch((err) => {
          console.error(`[Noti Error] Gửi shop thất bại: ${err.message}`);
        });
    } catch (notiErr) {
      console.error("Lỗi logic gửi thông báo:", notiErr);
    }

    createdOrders.push({
      orderId: orderDoc._id,
      shopId,
      orderTotalPrice,
      orderBreakdown: {
        shopSubtotal,
        shippingFee,
        shippingDiscount,
        shopDiscount,
        systemDiscount,
      },
      counts: {
        items: items.length,
        shopVouchers: shopVouchers.length,
        systemVouchers: systemVouchers.length,
        systemFreeShipVouchers: systemFreeShipVouchers.length,
      },
    });
  }

  // Đối chiếu tổng FE vs Server (tùy chọn)
  const feFinal = Number(orderTotals?.finalTotal || 0);
  const debugMismatch =
    feFinal !== serverGrandTotal
      ? {
          clientFinalTotal: feFinal,
          serverGrandTotal,
          note: "Server chốt theo công thức nội bộ; nếu lệch, kiểm tra logic voucher/ship.",
        }
      : undefined;

  return {
    success: true,
    message: "Tạo đơn theo từng shop thành công ( và khởi tạo payment.",
    paymentMethod,
    addressSnapshot,
    createdOrders,
    createdPayments,
    paymentErrors,
    ...(debugMismatch ? { debugMismatch } : {}),
  };
};

/** GET: tất cả đơn hàng cho admin (kèm items), có hỗ trợ lọc & sort, mặc định không phân trang */
exports.getOrders = async (q = {}) => {
  const filter = await buildCommonFilter(q);
  if (filter.orderStatusId === "__not_found__") {
    return {
      success: true,
      data: [],
      message: "Không tìm thấy trạng thái này",
    };
  }

  const sort = buildSort(q.sort);
  const page = Number(q.page);
  const limit = Number(q.limit);

  let query = Order.find(filter)
    .sort(sort)
    .populate("orderStatusId", "orderStatusName")
    .populate("customerId", "userFirstName userLastName")
    .populate("shopId")
    .populate("addressId");

  if (
    Number.isFinite(page) &&
    Number.isFinite(limit) &&
    page > 0 &&
    limit > 0
  ) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const orders = await query.lean();
  const ordersWithItems = await attachOrderDetails(orders);
  return { success: true, data: ordersWithItems };
};

exports.getOrderById = async (orderId) => {
  if (!mongoose.isValidObjectId(orderId)) {
    const err = new Error(`OrderId không hợp lệ`);
    err.status = 400;
    throw err;
  }

  const order = await Order.findById(orderId)
    .populate("orderStatusId", "orderStatusName")
    .populate("addressId")
    .populate("customerId", "userFirstName userLastName")
    .populate({
      path: "shopId",
      select: "shopName shopIsOfficial shopLogo",
    })
    .lean();

  if (!order) {
    const err = new Error(`Không tìm thấy đơn hàng`);
    err.status = 400;
    throw err;
  }

  const details = await OrderDetail.find({ orderId: order._id })
    .populate({
      path: "pvId",
      select: "pvName pvImages pvPrice productId pvOriginalPrice",
      populate: {
        path: "productId",
        select: "productName productDiscountPercent",
      },
    })
    .lean();
  return { success: true, data: { ...order, items: details } };
};

/** GET: đơn hàng theo người dùng (kèm items), có hỗ trợ lọc & sort, mặc định không phân trang */
exports.getOrdersByUserId = async (params, q = {}) => {
  const customerId = params.customerId || params.cId || null;
  const shopId = params.shopId || params.sId || null;

  if (!customerId && !shopId) {
    return { success: false, message: "Thiếu customerId hoặc shopId" };
  }

  const filter = await buildCommonFilter(q);

  // Nếu có customerId hoặc shopId thì thêm vào filter
  if (customerId) filter.customerId = customerId;
  if (shopId) filter.shopId = shopId;

  // Bổ sung tìm kiếm theo từ khóa (mã đơn hàng, _id)
  if (q.s && typeof q.s === "string" && q.s.trim() !== "") {
    const keyword = q.s.trim();
    filter._id = keyword;
  }

  // Kiểm tra id hợp lệ (shop hoặc customer)
  const targetId = customerId || shopId;
  if (!mongoose.isValidObjectId(targetId)) {
    return { success: false, message: "ID không hợp lệ" };
  }

  if (filter.orderStatusId === "__not_found__") {
    return {
      success: true,
      data: [],
      message: "Không tìm thấy trạng thái này",
    };
  }

  const sort = buildSort(q.sort);
  const page = Number(q.page);
  const limit = Number(q.limit);

  let query = Order.find(filter)
    .sort(sort)
    .populate("orderStatusId", "orderStatusName")
    .populate("shopId")
    .populate("addressId")
    .populate({
      path: "customerId",
      populate: {
        path: "_id",
        model: "User",
        select: "userAvatar userFirstName userLastName",
      },
    });

  if (
    Number.isFinite(page) &&
    Number.isFinite(limit) &&
    page > 0 &&
    limit > 0
  ) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const orders = await query;

  const ordersWithItems = await attachOrderDetails(
    orders.map((o) => o.toObject())
  );

  return { success: true, data: ordersWithItems };
};

exports.getOrderById = async (orderId) => {
  // 1. Kiểm tra ID hợp lệ
  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    return { success: false, message: "Mã đơn hàng không hợp lệ" };
  }

  try {
    // 2. Thực hiện Query (Giữ nguyên cấu trúc populate như hàm getOrdersByUserId)
    const order = await Order.findById(orderId)
      .populate("orderStatusId", "orderStatusName")
      .populate("shopId")
      .populate("addressId")
      .populate({
        path: "customerId",
        populate: {
          path: "_id",
          model: "User",
          select: "userAvatar userFirstName userLastName",
        },
      });

    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng" };
    }

    // 3. Gắn thêm chi tiết (Order Details / Items)
    // Hàm attachOrderDetails thường nhận vào một mảng object thuần (JSON)
    const ordersWithItems = await attachOrderDetails([order.toObject()]);

    return { success: true, data: ordersWithItems };
  } catch (error) {
    console.error("getOrderById error:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi lấy chi tiết đơn hàng",
    };
  }
};

exports.updateOrders = async (orderId, patch = {}, io) => {
  try {
    // 1. Validate orderId
    if (!mongoose.isValidObjectId(orderId)) {
      return { success: false, message: "orderId không hợp lệ" };
    }

    // 2. Lấy đơn hàng hiện tại
    const order = await Order.findById(orderId).populate(
      "orderStatusId",
      "orderStatusName"
    );

    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng" };
    }

    const currentStatus = order.orderStatusId?.orderStatusName || "Unknown";

    // 3. Xác định có phải đang hủy đơn không
    let isCancelling = false;

    if (patch.orderStatusName === "Cancelled") {
      isCancelling = true;
    } else if (
      patch.orderStatusId &&
      mongoose.isValidObjectId(patch.orderStatusId)
    ) {
      const targetStatus = await OrderStatus.findById(patch.orderStatusId)
        .select("orderStatusName")
        .lean();
      if (targetStatus?.orderStatusName === "Cancelled") {
        isCancelling = true;
      }
    }

    // 4. Nếu là hủy đơn -> kiểm tra trạng thái cho phép + hoàn kho
    if (isCancelling) {
      const allowedCancelStatuses = ["Pending", "Confirmed"];
      if (!allowedCancelStatuses.includes(currentStatus)) {
        return {
          success: false,
          message: `Không thể hủy đơn hàng ở trạng thái "${currentStatus}". Chỉ hủy được khi Chờ xác nhận hoặc Đã xác nhận.`,
        };
      }

      const details = await OrderDetail.find({ orderId: order._id })
        .select("pvId odQuantity")
        .lean();

      for (const detail of details) {
        await productService.refundVariation(detail.pvId, detail.odQuantity);
      }
    }

    if (patch.orderStatusName) {
      const statusId = await ensureOrderStatusByName(patch.orderStatusName);
      patch.orderStatusId = statusId;
    }

    // 6. Áp trạng thái mới
    if (patch.orderStatusId && mongoose.isValidObjectId(patch.orderStatusId)) {
      order.orderStatusId = patch.orderStatusId;
    }

    // 7. Các trường giá
    const priceFields = [
      "orderSubtotalPrice",
      "orderShippingFee",
      "orderShippingDiscount",
      "orderShopDiscount",
      "orderSystemDiscount",
    ];
    let pricesChanged = false;

    for (const field of priceFields) {
      if (field in patch) {
        order[field] = Math.max(0, Number(patch[field]) || 0);
        pricesChanged = true;
      }
    }

    if (pricesChanged) {
      order.orderTotalPrice = computeLineTotal({
        shopSubtotal: order.orderSubtotalPrice,
        shippingFee: order.orderShippingFee,
        shippingDiscount: order.orderShippingDiscount,
        shopDiscount: order.orderShopDiscount,
        systemDiscount: order.orderSystemDiscount,
      });
    }

    // 8. Các field khác
    if ("orderDeliveryDate" in patch) {
      order.orderDeliveryDate = patch.orderDeliveryDate
        ? new Date(patch.orderDeliveryDate)
        : null;
    }
    if ("addressId" in patch && mongoose.isValidObjectId(patch.addressId)) {
      order.addressId = patch.addressId;
    }
    if ("paymentMethod" in patch) {
      order.paymentMethod = patch.paymentMethod;
    }
    if ("shopId" in patch && mongoose.isValidObjectId(patch.shopId)) {
      order.shopId = patch.shopId;
    }

    // 9. Lưu lại vào DB
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: order },
      { new: true }
    ).populate("orderStatusId", "orderStatusName");

    if (!updatedOrder) {
      return {
        success: false,
        message: "Cập nhật thất bại (không rõ nguyên nhân)",
      };
    }

    if (patch.orderStatusName) {
      const newStatusName =
        updatedOrder.orderStatusId?.orderStatusName || patch.orderStatusName;
      if (newStatusName) {
        const notiContent = getNotificationTemplate(
          newStatusName,
          updatedOrder._id
        );

        const notiData = {
          recipientId: updatedOrder.customerId.toString(),
          recipientRole: "customer",
          title: notiContent.title,
          message: notiContent.message,
          type:
            newStatusName !== "Cancelled"
              ? "ORDER_STATUS_UPDATE"
              : "ORDER_CANCELLED",
          sourceId: updatedOrder._id,
          sourceModel: "Order",
          metaData: { status: newStatusName },
        };

        try {
          await notificationServer.createNotificationAndEmit(notiData, io);
        } catch (err) {
          console.error(
            "[Thông báo] Lỗi khi gửi cập nhật trạng thái đơn hàng:",
            err.message
          );
        }
      }
    }

    const targetStatusName =
      patch.orderStatusName || updatedOrder.orderStatusId?.orderStatusName;
    const shopId = updatedOrder.shopId ? updatedOrder.shopId.toString() : null;
    const customerId = updatedOrder.customerId
      ? updatedOrder.customerId.toString()
      : null;

    if (targetStatusName === "Succeeded") {
      await paymentService.updatePayment(
        { orderId },
        {
          paymentStatus: "Completed",
          paymentDate: new Date(),
          shopId,
        }
      );
    }

    if (isCancelling) {
      //Xu ly  cho shopId
      await paymentService.updatePayment(
        { orderId },
        {
          paymentStatus: "Failed",
          paymentDate: new Date(),
          shopId,
          customerId,
        }
      );
    }

    return {
      success: true,
      message: isCancelling
        ? "Hủy đơn hàng và hoàn kho thành công"
        : "Cập nhật đơn hàng thành công",
      order: updatedOrder,
    };
  } catch (err) {
    console.error("Lỗi trong updateOrders:", err);
    return {
      success: false,
      message: `Lỗi server trong updateOrders, ${err}`,
      error: err.message,
      stack: err.stack,
    };
  }
};

exports.getOrderCountsByStatus = async (body = {}) => {
  const { customerId, shopId } = body;

  // Xây dựng điều kiện match động
  const matchStage = {};
  if (customerId) {
    matchStage.customerId = new mongoose.Types.ObjectId(customerId);
  } else if (shopId) {
    matchStage.shopId = new mongoose.Types.ObjectId(shopId);
  }
  // Nếu không có cId hoặc shopId => matchStage = {}  (admin xem toàn bộ)

  const counts = await Order.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "orderstatuses", // tên collection
        localField: "orderStatusId",
        foreignField: "_id",
        as: "statusInfo",
      },
    },
    { $unwind: "$statusInfo" },
    {
      $group: {
        _id: "$statusInfo.orderStatusName",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }, // sắp xếp theo tên trạng thái (tùy chọn)
  ]);

  // Chuyển từ mảng sang object gọn hơn
  const result = {};
  counts.forEach((item) => {
    result[item._id] = item.count;
  });

  // Phân loại vai trò để trả thông điệp rõ ràng
  let role = "Admin";
  if (customerId) role = "Customer";
  else if (shopId) role = "Shop";

  return {
    success: true,
    counts: result,
    role,
    message: `Lấy số lượng đơn hàng theo trạng thái thành công cho vai trò ${role}`,
  };
};

exports.getOrderDashboardStats = async (query = {}) => {
  const { from, to, shopId } = query;

  // Xây dựng điều kiện lọc
  const match = {};

  // Lọc theo shop (nếu có shopId -> thống kê cho shop, nếu không -> cho admin)
  let role = "Admin";
  if (shopId && mongoose.isValidObjectId(shopId)) {
    match.shopId = new mongoose.Types.ObjectId(shopId);
    role = "Shop";
  }

  // Lọc theo khoảng thời gian (dùng createdAt cho thống nhất với getOrders/buildCommonFilter)
  if (from || to) {
    match.createdAt = {};

    if (from) {
      const dFrom = new Date(from);
      if (!isNaN(dFrom.getTime())) {
        dFrom.setHours(0, 0, 0, 0);
        match.createdAt.$gte = dFrom;
      }
    }

    if (to) {
      const dTo = new Date(to);
      if (!isNaN(dTo.getTime())) {
        dTo.setHours(23, 59, 59, 999);
        match.createdAt.$lte = dTo;
      }
    }
  }

  // Pipeline tổng hợp
  const stats = await Order.aggregate([
    { $match: match },

    // Join sang OrderStatus để lấy tên trạng thái
    {
      $lookup: {
        from: "orderstatuses",
        localField: "orderStatusId",
        foreignField: "_id",
        as: "statusInfo",
      },
    },
    { $unwind: { path: "$statusInfo", preserveNullAndEmptyArrays: true } },

    {
      $facet: {
        // 1) Tổng quan
        summary: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$orderTotalPrice" },
              totalSubtotal: { $sum: "$orderSubtotalPrice" },
              totalShippingFee: { $sum: "$orderShippingFee" },
              totalShippingDiscount: { $sum: "$orderShippingDiscount" },
              totalShopDiscount: { $sum: "$orderShopDiscount" },
              totalSystemDiscount: { $sum: "$orderSystemDiscount" },
            },
          },
        ],

        // 2) Theo trạng thái
        byStatus: [
          {
            $group: {
              _id: "$statusInfo.orderStatusName",
              count: { $sum: 1 },
              revenue: { $sum: "$orderTotalPrice" },
            },
          },
          { $sort: { _id: 1 } },
        ],
        // 3) Theo ngày (dùng để vẽ biểu đồ) — chỉ lấy đơn Succeeded
        daily: [
          {
            $match: { "statusInfo.orderStatusName": "Succeeded" },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$orderTotalPrice" },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },

    // Lấy phần tử đầu tiên của summary (vì facet trả mảng)
    {
      $project: {
        summary: { $arrayElemAt: ["$summary", 0] },
        byStatus: 1,
        daily: 1,
      },
    },
  ]);

  const result = stats[0] || {
    summary: null,
    byStatus: [],
    daily: [],
  };

  // Chuẩn hóa summary (tránh undefined)
  const safeSummary = result.summary || {
    totalOrders: 0,
    totalRevenue: 0,
    totalSubtotal: 0,
    totalShippingFee: 0,
    totalShippingDiscount: 0,
    totalShopDiscount: 0,
    totalSystemDiscount: 0,
  };

  return {
    success: true,
    message:
      role === "Shop"
        ? "Thống kê dashboard đơn hàng cho shop thành công"
        : "Thống kê dashboard đơn hàng toàn hệ thống thành công",
    role,
    filter: {
      from: from || null,
      to: to || null,
      shopId: shopId || null,
    },
    data: {
      summary: safeSummary,
      byStatus: result.byStatus,
      daily: result.daily,
    },
  };
};
