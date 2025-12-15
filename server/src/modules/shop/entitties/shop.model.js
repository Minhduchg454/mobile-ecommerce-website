// models/ShopProfile.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopSchema = new Schema(
  {
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
    },
    shopDescription: { type: String },
    shopLogo: { type: String },
    shopBanner: { type: [String], default: [] },
    shopBackground: { type: String },
    shopCreateAt: { type: Date, default: Date.now },
    shopRateAvg: { type: Number, default: 0, min: 0, max: 5 },
    shopRateCount: { type: Number, default: 0 },
    shopProductCount: { type: Number, default: 0 },
    shopSoldCount: { type: Number, default: 0 },
    shopStatus: {
      type: String,
      enum: ["pending", "rejected", "approved", "blocked"],
      default: "pending",
    },
    shopIsOfficial: { type: Boolean, default: false },
    shopReviewReason: {
      type: String,
      trim: true,
      default: null,
    },
    shopReviewedAt: {
      type: Date,
      default: null,
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
  { _id: false },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
