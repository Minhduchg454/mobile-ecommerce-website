// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    // Bạn có thể thêm các trường bổ sung thường có cho coupon như:
    couponCode: {
      // Mã code thực tế để người dùng nhập (ví dụ: 'SALE20')
      type: String,
      unique: true,
      trim: true,
      uppercase: true, // Chuyển đổi thành chữ in hoa
      // required: true // Thường là bắt buộc
    },
    couponDescription: {
      // Theo biểu đồ: description: String
      type: String,
      trim: true, // Loại bỏ khoảng trắng ở đầu/cuối
    },
    // Bổ sung loại giảm giá (phần trăm hay giá trị cố định)
    couponDiscountType: {
      type: String,
      enum: ["percentage", "fixed_amount"], // Ví dụ: 'percentage' (%), 'fixed_amount' (giá trị cố định)
      required: true,
    },
    couponDiscount: {
      // Theo biểu đồ: discount: NumberDouble (mức giảm giá)
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
      // Số lần coupon có thể được sử dụng (tổng cộng)
      type: Number,
      default: -1, // -1 có thể biểu thị không giới hạn
    },

    couponUsedCount: {
      // Số lần coupon đã được sử dụng
      type: Number,
      default: 0,
    },
    couponMinOrderAmount: {
      // Số tiền đơn hàng tối thiểu để áp dụng coupon
      type: Number,
      default: 0,
    },
    couponmaxDiscountAmount: {
      type: Number,
      default: null,
    },
    createdByType: {
      type: String,
      enum: ["Shop", "Admin"], // tên model
      required: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByType", // tên field chứa model cần ref
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
