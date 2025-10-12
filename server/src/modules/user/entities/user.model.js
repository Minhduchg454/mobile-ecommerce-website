const mongoose = require("mongoose");

// Định nghĩa schema chung cho User, Customer, Admin
const userBaseSchema = new mongoose.Schema(
  {
    userFirstName: {
      type: String, // Họ
      required: true,
      trim: true,
    },
    userLastName: {
      type: String, // Tên
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    userAvatar: {
      type: String, // Đường dẫn ảnh đại diện
    },
    userMobile: {
      type: String,
      unique: true,
      sparse: true, // chỉ yêu cầu unique nếu có giá trị
      trim: true,
      default: undefined,
    },
    userGender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
      required: false,
    },

    userDateOfBirth: {
      type: Date,
      required: false,
    },
    userStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserStatus",
      required: false,
    },

    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart",
      required: false,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("User", userBaseSchema);
