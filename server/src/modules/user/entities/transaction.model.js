const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    tranBalanceFor: {
      type: String,
      enum: ["shop", "customer", "admin"],
      required: true,
    },
    tranAmount: { type: Number, required: true, min: 0 },
    tranType: {
      type: String,
      enum: [
        "deposit", // 1. Nạp tiền (Giữ dự phòng)
        "withdraw", // 2. Rút tiền về ngân hàng
        "payment_income", // 3. Nhận tiền bán hàng
        "refund_deduct", // 4. Hoàn tiền đơn hàng shop
        "refund_receive", // 5. Hoàn tiền đơn hàng khách
        "service_payment", // 5. Mua gói dịch vụ/Subcription
        "system_fee", // 6. Phí sàn (VD: Trừ 2% mỗi đơn - Dự phòng)
      ],
      required: true,
    },
    tranAction: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    tranBalanceBefore: { type: Number, required: true },
    tranBalanceAfter: { type: Number, required: true },
    tranDescriptions: { type: String, default: "" },
    tranRelatedId: { type: Schema.Types.ObjectId, index: true },
    tranRelatedModel: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index để query lịch sử nhanh
transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
