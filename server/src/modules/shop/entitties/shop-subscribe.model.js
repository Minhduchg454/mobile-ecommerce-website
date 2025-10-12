// models/ShopSubscribe.js
const mongoose = require("mongoose");

const shopSubscribeSchema = new mongoose.Schema(
  {
    subStartDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    subExpirationDate: {
      type: Date,
      required: true,
    },
    subStatus: {
      type: String,
      enum: ["pending", "active", "expired", "canceled"],
      default: "pending",
      index: true,
    },
    subAutoRenew: {
      type: Boolean,
      default: true,
    },
    subPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePlan",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ràng buộc: mỗi shop chỉ có 1 gói active tại 1 thời điểm
shopSubscribeSchema.index(
  { shopId: 1, subStatus: 1 },
  { unique: true, partialFilterExpression: { subStatus: "active" } }
);

module.exports = mongoose.model("ShopSubscribe", shopSubscribeSchema);
