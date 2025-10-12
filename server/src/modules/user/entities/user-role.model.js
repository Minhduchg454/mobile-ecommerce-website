// models/Role.js
const mongoose = require("mongoose");

// Định nghĩa schema cho vai trò người dùng (User Role)
const userRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của User
      ref: "User",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Role
      ref: "Role",
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("UserRole", userRoleSchema);
