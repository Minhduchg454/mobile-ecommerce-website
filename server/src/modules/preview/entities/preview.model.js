// models/Preview.js
const mongoose = require("mongoose");

// Định nghĩa schema cho đánh giá sản phẩm của khách hàng
const previewSchema = new mongoose.Schema(
  {
    previewComment: {
      type: String, // Nội dung đánh giá
      trim: true,
    },
    previewDate: {
      type: Date, // Ngày đánh giá
      default: Date.now,
    },
    previewRate: {
      type: Number, // Điểm đánh giá (1-5)
      required: true,
      min: 1,
      max: 5,
    },
    previewImages: {
      type: [String],
      default: [],
    },
    previewVideos: {
      type: [String],
      default: [],
    },

    // Liên kết với User: mỗi Preview thuộc về một User (khách hàng)
    customerId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến Customer
      ref: "Customer",
      required: true,
    },
    // Liên kết với ProductVariation: mỗi Preview đánh giá một ProductVariation cụ thể
    pvId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến ProductVariation
      ref: "ProductVariation",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("Preview", previewSchema);
