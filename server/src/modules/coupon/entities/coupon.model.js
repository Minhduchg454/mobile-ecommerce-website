// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    // Bạn có thể thêm các trường bổ sung thường có cho coupon như:
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      required: true,
    },
    couponDescription: {
      type: String,
      trim: true, // Loại bỏ khoảng trắng ở đầu/cuối
    },
    couponDiscountType: {
      type: String,
      enum: ["percentage", "fixed_amount"], // Ví dụ: 'percentage' (%), 'fixed_amount' (giá trị cố định)
      required: true,
    },

    //Gia tri giam dua tren couponDiscountType
    couponDiscount: {
      type: Number,
      required: true,
      min: 0, // Giảm giá không thể âm
    },

    couponStartDate: {
      // Theo biểu đồ: startDate: Date
      type: Date,
      default: Date.now, // Mặc định là ngày hiện tại khi tạo
    },
    couponExpirationDate: {
      // Theo biểu đồ: expirationDate: Date
      type: Date,
      required: true, // Ngày hết hạn là bắt buộc
    },

    couponIsActive: {
      // Trạng thái hoạt động của coupon
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
      // Số tiền đơn hàng tối thiểu để áp dụng coupon
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
