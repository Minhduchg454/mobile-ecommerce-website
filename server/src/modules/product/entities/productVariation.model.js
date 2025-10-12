// models/ProductVariation.js
const mongoose = require("mongoose");

const productVariationSchema = new mongoose.Schema(
  {
    pvName: {
      type: String,
      required: true,
      trim: true,
    },
    pvSlug: {
      type: String,
      required: true,
      lowercase: true,
    },
    //Gia ban dau neu co
    pvOriginalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    //Gia cuoi cung
    pvPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    pvStockQuantity: {
      // Số lượng tồn kho
      type: Number, // NumberInt
      required: true,
      default: 0,
      min: 0,
    },
    pvSoldCount: {
      // Số lượng đã bán của biến thể này
      type: Number, // NumberInt
      default: 0,
      min: 0,
    },
    pvImages: {
      type: [String],
      default: [],
    },
    pvRateAvg: {
      // Đánh giá trung bình của biến thể này
      type: Number, // Sử dụng NumberDouble để lưu trữ giá trị thập phâ
      default: 5,
      min: 0,
      max: 5,
    },
    pvRateCount: {
      // Tổng số lượt đánh giá
      type: Number, // Sử dụng NumberInt để lưu trữ số nguyên
      default: 0,
      min: 0,
    },
    // Mối quan hệ với Product (ProductVariation thuộc về một Product)
    productId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Product
      ref: "Product", // Tên model Product
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Đảm bảo tên biến thể là duy nhất trong mỗi productId
productVariationSchema.index({ productId: 1, pvName: 1 }, { unique: true });

// Đảm bảo slug là duy nhất trong mỗi productId
productVariationSchema.index({ productId: 1, pvSlug: 1 }, { unique: true });

module.exports = mongoose.model("ProductVariation", productVariationSchema);
