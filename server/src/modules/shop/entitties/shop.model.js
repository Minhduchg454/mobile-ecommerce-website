// models/ShopProfile.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopSchema = new Schema(
  {
    //Khoa chinh
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: { type: String, required: true },
    shopSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    shopDescription: { type: String },
    shopLogo: { type: String },
    shopBanner: { type: [String], default: [] },
    shopBackground: { type: String },
    shopCreateAt: { type: Date, default: Date.now },
    shopRateAvg: { type: Number, default: 5, min: 0, max: 5 },
    shopRateCount: { type: Number, default: 0 },
    shopProductCount: { type: Number, default: 0 },
    shopSoldCount: { type: Number, default: 0 },
    shopColor: { type: String, default: "#ffffff" },
    shopStatus: {
      type: String,
      enum: ["pending", "approved", "blocked"], // chỉ cho phép 3 giá trị
      default: "pending", // mặc định khi tạo shop mới
    },
    shopIsOffical: { type: Boolean },
    default: false,
  },
  { _id: false },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
