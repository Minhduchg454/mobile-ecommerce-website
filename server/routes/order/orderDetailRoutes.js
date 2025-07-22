const express = require("express");
const router = express.Router();
const {
  createNewOrderDetail,
  getOrderDetails,
  updateOrderDetail,
  deleteOrderDetail,
} = require("../../controllers/order/orderDetailController");

// Route GET - lấy danh sách chi tiết đơn hàng theo điều kiện truyền vào (orderId, productVariationId)
router.get("/", getOrderDetails);

// Route POST - tạo chi tiết đơn hàng mới
router.post("/", createNewOrderDetail);

// Route PUT - cập nhật chi tiết đơn hàng theo ID
router.put("/:odid", updateOrderDetail);

// Route DELETE - xoá chi tiết đơn hàng theo ID
router.delete("/:odid", deleteOrderDetail);

module.exports = router;
