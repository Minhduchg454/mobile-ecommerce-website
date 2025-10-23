// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productSlug: {
    // URL thân thiện, thường được tạo từ productName
    type: String,
    required: true,
    lowercase: true,
  },
  productDescription: {
    type: String,
    trim: true,
  },
  productThumb: {
    type: String, // Đường dẫn đến hình ảnh thumbnail
    required: true,
  },
  productCreateAt: {
    // createAt trong biểu đồ
    type: Date,
    default: Date.now, // Tự động điền ngày hiện tại khi tạo
  },
  productMinOriginalPrice: {
    type: Number, // NumberInt
    default: 0,
  },
  productMinPrice: {
    type: Number, // NumberInt
    default: 0,
  },
  productRateAvg: {
    // Điểm đánh giá trung bình
    type: Number, // NumberInt
    default: 5,
    min: 0,
    max: 5, // Điểm đánh giá thường từ 0 đến 5
  },
  productSoldCount: {
    //Tong so luong bien the ban ra
    type: Number,
    default: 0,
  },
  productRateCount: {
    // Tổng số lượt đánh giá
    type: Number, // NumberDouble
    default: 0,
  },
  productStockQuantity: {
    //Tong so luong san pham tu tat ca bien the
    type: Number,
    default: 0,
  },
  // Them moi
  productIsOnSale: {
    type: Boolean,
    default: false,
  },
  productDiscountPercent: {
    type: Number,
    default: 0.0,
  },

  productContentBlocks: [
    {
      type: {
        type: String,
        enum: ["text", "image", "video", "videoUrl"],
        required: true,
      },
      content: String, // text content
      url: String, // image/video/videoUrl URL,
      format: {
        type: String,
        enum: ["plain", "markdown", "html"],
        default: "plain",
      },
      alt: String,
      order: { type: Number, index: 1 },
    },
  ],
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
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Brand
    ref: "Brand", // Tên model Brand
  },
});

productSchema.index({ shopId: 1, productSlug: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
