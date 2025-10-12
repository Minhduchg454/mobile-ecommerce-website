// models/Brand.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const brandSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    brandSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, 
    },
    brandLogo: {
      type: String, // lưu URL hoặc đường dẫn ảnh logo
      default: "",
    },
  },
  {
    timestamps: true, // có sẵn createdAt và updatedAt
  }
);

// Tạo chỉ mục tìm kiếm tên và slug
brandSchema.index({ brandName: 1 });
brandSchema.index({ brandSlug: 1 }, { unique: true });

module.exports = model("Brand", brandSchema);
