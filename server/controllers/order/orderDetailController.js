const asyncHandler = require("express-async-handler");
const OrderDetail = require("../../models/order/OrderDetail");
const Order = require("../../models/order/Order");

// ✅ Tạo mới OrderDetail
const createNewOrderDetail = asyncHandler(async (req, res) => {
  const response = await OrderDetail.create(req.body);
  return res.json({
    success: !!response,
    createdOrderDetail: response || "Cannot create new order detail",
  });
});

//Lay order theo dieu kien loc
const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId, productVariationId } = req.query;

    const filter = {};
    if (orderId) filter.orderId = orderId;
    if (productVariationId) filter.productVariationId = productVariationId;

    const details = await OrderDetail.find(filter).populate(
      "productVariationId"
    );

    res.status(200).json({
      success: true,
      count: details.length,
      data: details,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// ✅ Cập nhật OrderDetail theo ID
const updateOrderDetail = asyncHandler(async (req, res) => {
  const { odid } = req.params;

  const response = await OrderDetail.findByIdAndUpdate(odid, req.body, {
    new: true,
  });

  return res.json({
    success: !!response,
    updatedOrderDetail: response || "Cannot update order detail",
  });
});

// ✅ Xoá OrderDetail theo ID
const deleteOrderDetail = asyncHandler(async (req, res) => {
  const { odid } = req.params;

  const detail = await OrderDetail.findById(odid);
  if (!detail)
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy OrderDetail để xoá.",
    });

  // Tuỳ chọn: kiểm tra xem Order đã bị hủy hay chưa trước khi xóa
  const order = await Order.findById(detail.orderId);
  if (!order || order.status === "Cancelled") {
    return res.status(400).json({
      success: false,
      message: "Không thể xoá chi tiết đơn hàng đã bị huỷ.",
    });
  }

  const response = await OrderDetail.findByIdAndDelete(odid);
  return res.json({
    success: !!response,
    deletedOrderDetail: response || "Cannot delete order detail",
  });
});

module.exports = {
  createNewOrderDetail,
  getOrderDetails,
  updateOrderDetail,
  deleteOrderDetail,
};
