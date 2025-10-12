// models/OrderDetail.js
const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
  odQuantity: {
    type: Number, // NumberInt
    required: true,
    min: 1, // Đảm bảo số lượng ít nhất là 1
  },
  odPrice: {
    type: Number, // NumberDouble (đây là giá của từng item hoặc giá tổng của item đó trong order detail)
    required: true,
    min: 0,
  },
  // Mối quan hệ với Order: Mỗi OrderDetail thuộc về một Order
  orderId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
    ref: "Order", // Tên model mà chúng ta đang tham chiếu
    required: true,
  },
  // Bạn có thể muốn thêm một tham chiếu đến sản phẩm mà chi tiết này mô tả
  pvId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariation", // Giả sử bạn có model Product
    required: true,
  },
});

orderDetailSchema.index({ orderId: 1, pvId: 1 }, { unique: true });

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
