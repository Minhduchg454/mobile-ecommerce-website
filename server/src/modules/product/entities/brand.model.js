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
      type: String, // lưu URL hoặc đường dẫn ảnh logo
      default: "",
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
