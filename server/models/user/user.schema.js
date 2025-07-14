const mongoose = require("mongoose");

// Định nghĩa schema chung cho User, Customer, Admin
const userBaseSchema = new mongoose.Schema(
  {
    firstName: {
      type: String, // Họ
      required: true,
      trim: true,
    },
    lastName: {
      type: String, // Tên
      required: true,
      trim: true,
    },
    email: {
      type: String, // Email duy nhất
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    avatar: {
      type: String, // Đường dẫn ảnh đại diện
    },
    mobile: {
      type: String,
      unique: true,
      required: false, // cho phép không có
      sparse: true, // chỉ yêu cầu unique nếu có giá trị
      trim: true,
    },
    userName: {
      type: String, // Tên đăng nhập duy nhất
      unique: true,
      required: true,
      trim: true,
    },
    statusUserId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến StatusUser
      ref: "StatusUser",
      required: false,
    },
    address: {
      type: String,
      default: "",
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến Role
      ref: "Role",
      required: false,
    },
    // Customer-specific fields (chỉ sử dụng khi role là customer)
    shoppingCart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart",
      required: false,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = userBaseSchema;
