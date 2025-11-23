const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const balanceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balanceFor: {
      type: String,
      required: true,
      enum: ["shop", "admin", "customer"],
      default: "customer",
    },
    balanceCurrent: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0,
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

// Index duy nhất tổng hợp
balanceSchema.index(
  { userId: 1, balanceFor: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

module.exports = model("Balance", balanceSchema);
