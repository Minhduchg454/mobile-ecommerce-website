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
    pvOriginalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    pvPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    pvStockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pvSoldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pvImages: {
      type: [String],
      default: [],
    },
    pvRateAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    pvRateCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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
    timestamps: true,
  }
);

// Tên biến thể duy nhất trong mỗi productId (chỉ áp dụng cho biến thể chưa xóa)
productVariationSchema.index(
  { productId: 1, pvName: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: { $ne: true },
    },
  }
);

// Slug biến thể duy nhất trong mỗi productId (chỉ áp dụng cho biến thể chưa xóa)
productVariationSchema.index(
  { productId: 1, pvSlug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: { $ne: true },
    },
  }
);

module.exports = mongoose.model("ProductVariation", productVariationSchema);
