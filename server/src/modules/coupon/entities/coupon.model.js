const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      required: true,
    },
    couponDescription: {
      type: String,
      trim: true,
    },
    couponDiscountType: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      required: true,
    },
    couponDiscount: {
      type: Number,
      required: true,
      min: 0,
    },

    couponStartDate: {
      type: Date,
      default: Date.now,
    },
    couponExpirationDate: {
      type: Date,
      required: true,
    },

    couponIsActive: {
      type: Boolean,
      default: true,
    },
    couponUsageLimit: {
      type: Number,
      default: -1,
    },
    couponUsedCount: {
      type: Number,
      default: 0,
    },
    couponMinOrderAmount: {
      type: Number,
      default: 0,
    },
    couponMaxDiscountAmount: {
      type: Number,
      default: null,
    },
    createdByType: {
      type: String,
      enum: ["Shop", "Admin"],
      required: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByType",
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
couponSchema.index(
  { couponCode: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model("Coupon", couponSchema);
