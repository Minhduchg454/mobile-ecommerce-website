const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bankSchema = new Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    bankCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    bankLogo: {
      type: String,
      default: "",
    },
    bankStatus: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "INACTIVE"],
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

bankSchema.index(
  { bankName: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

// Đánh chỉ mục (Index) để đảm bảo bankCode là duy nhất (trừ các bản ghi đã xóa)
bankSchema.index(
  { bankCode: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

module.exports = model("Bank", bankSchema);
