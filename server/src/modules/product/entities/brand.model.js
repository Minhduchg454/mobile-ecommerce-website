const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const brandSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    brandSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    brandLogo: {
      type: String,
      default: "",
    },
    brandStatus: {
      type: String,
      enum: ["pending", "approved", "blocked", "rejected"],
      default: "pending",
    },
    brandWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    brandDescription: {
      type: String,
      trim: true,
      default: "",
    },
    brandRequestedById: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    brandReviewReason: {
      type: String,
      trim: true,
      default: null,
    },
    brandReviewedAt: {
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
  {
    timestamps: true,
  }
);

brandSchema.index(
  { brandName: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

brandSchema.index(
  { brandSlug: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

module.exports = model("Brand", brandSchema);
