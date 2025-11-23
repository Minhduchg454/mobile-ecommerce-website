// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productSlug: {
    type: String,
    required: true,
    lowercase: true,
  },
  productDescription: {
    type: String,
    trim: true,
  },
  productThumb: {
    type: String,
    required: true,
  },
  productCreateAt: {
    type: Date,
    default: Date.now,
  },
  productMinOriginalPrice: {
    type: Number,
    default: 0,
  },
  productMinPrice: {
    type: Number,
    default: 0,
  },
  productRateAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  productSoldCount: {
    type: Number,
    default: 0,
  },
  productRateCount: {
    type: Number,
    default: 0,
  },
  productStockQuantity: {
    type: Number,
    default: 0,
  },

  productIsOnSale: {
    type: Boolean,
    default: false,
  },
  productDiscountPercent: {
    type: Number,
    default: 0.0,
  },
  productStatus: {
    type: String,
    enum: ["pending", "approved", "blocked", "rejected"],
    default: "pending",
  },
  productContentBlocks: [
    {
      type: {
        type: String,
        enum: ["text", "image", "video", "videoUrl"],
        required: true,
      },
      content: String,
      url: String,
      format: {
        type: String,
        enum: ["plain", "markdown", "html"],
        default: "plain",
      },
      alt: String,
      order: { type: Number, index: 1 },
    },
  ],
  productReviewReason: {
    type: String,
    trim: true,
    default: null,
  },
  productReviewedAt: {
    type: Date,
    default: null,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  categoryShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryShop",
  },
  variationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariation",
    default: null,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    require: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
  },
});

productSchema.index(
  { shopId: 1, productSlug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: { $ne: true },
    },
  }
);

productSchema.index({ productName: "text" });

module.exports = mongoose.model("Product", productSchema);
