const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const paymentAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bankId: {
      type: Schema.Types.ObjectId,
      ref: "Bank",
      required: false,
      default: null,
    },
    paType: {
      type: String,
      required: true,
      trim: true,
    },
    paBeneficiaryName: {
      type: String,
      required: true,
      trim: true,
    },
    paAccountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    paIsDefault: {
      type: Boolean,
      default: false,
    },
    paStatus: {
      type: String,
      default: "ACTIVE",
    },
    paFor: {
      type: String,
      enum: ["customer", "shop", "admin"],
      default: "customer",
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

// Index: Đảm bảo tính duy nhất
paymentAccountSchema.index(
  { userId: 1, paFor: 1, paType: 1, paAccountNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

paymentAccountSchema.index(
  { userId: 1, paFor: 1, paIsDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { paIsDefault: true, isDeleted: { $ne: true } },
  }
);

module.exports = model("PaymentAccount", paymentAccountSchema);
