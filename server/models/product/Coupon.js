// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    description: {
      // Theo biểu đồ: description: String
      type: String,
      trim: true, // Loại bỏ khoảng trắng ở đầu/cuối
    },
    discount: {
      // Theo biểu đồ: discount: NumberDouble (mức giảm giá)
      type: Number,
      required: true,
      min: 0, // Giảm giá không thể âm
    },
    // Bổ sung loại giảm giá (phần trăm hay giá trị cố định)
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount"], // Ví dụ: 'percentage' (%), 'fixed_amount' (giá trị cố định)
      required: true,
    },

    startDate: {
      // Theo biểu đồ: startDate: Date
      type: Date,
      default: Date.now, // Mặc định là ngày hiện tại khi tạo
    },
    expirationDate: {
      // Theo biểu đồ: expirationDate: Date
      type: Date,
      required: true, // Ngày hết hạn là bắt buộc
    },
    // Bạn có thể thêm các trường bổ sung thường có cho coupon như:
    couponCode: {
      // Mã code thực tế để người dùng nhập (ví dụ: 'SALE20')
      type: String,
      unique: true,
      trim: true,
      uppercase: true, // Chuyển đổi thành chữ in hoa
      // required: true // Thường là bắt buộc
    },
    isActive: {
      // Trạng thái hoạt động của coupon
      type: Boolean,
      default: true,
    },
    usageLimit: {
      // Số lần coupon có thể được sử dụng (tổng cộng)
      type: Number,
      default: -1, // -1 có thể biểu thị không giới hạn
    },
    miniOrderAmount: {
      // Số tiền đơn hàng tối thiểu để áp dụng coupon
      type: Number,
      default: 0,
    },
    usedCount: {
      // Số lần coupon đã được sử dụng
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Admin
      ref: "Admin", // Tên model User
      required: true,
      index: true, // Tạo chỉ mục để tìm kiếm nhanh hơn
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

couponSchema.set("toJSON", {
  versionKey: false,
});

module.exports = mongoose.model("Coupon", couponSchema);
