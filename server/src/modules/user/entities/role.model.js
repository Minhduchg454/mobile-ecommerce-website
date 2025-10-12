// models/Role.js
const mongoose = require("mongoose");

// Định nghĩa schema cho vai trò người dùng (User Role)
const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    enum: ["admin", "customer", "shop"],
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
