// models/Preview.js
const mongoose = require("mongoose");

// Định nghĩa schema cho đánh giá sản phẩm của khách hàng
const previewSchema = new mongoose.Schema(
  {
    previewComment: {
      type: String,
      trim: true,
    },
    previewDate: {
      type: Date,
      default: Date.now,
    },
    previewRate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    previewImages: {
      type: [String],
      default: [],
    },
    previewVideos: {
      type: String,
      default: "",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    pvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("Preview", previewSchema);
