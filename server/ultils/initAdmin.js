// scripts/initAdmin.js
const Account = require("../models/user/Account");
const User = require("../models/user/User");
const Admin = require("../models/user/Admin");
const Role = require("../models/user/Role");
const StatusUser = require("../models/user/StatusUser");

const DEFAULT_ADMIN = {
  firstName: "Admin",
  lastName: "Root",
  email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
  mobile: "0123456789",
};

module.exports = async function initAdmin() {
  const existedAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
  if (existedAdmin) return console.log("Admin đã tồn tại. Bỏ qua tạo mới.");

  const activeStatus = await StatusUser.findOne({ statusUserName: "active" });
  if (!activeStatus) throw new Error("Không tìm thấy trạng thái 'active'");

  const adminRole = await Role.findOne({ roleName: "admin" });
  if (!adminRole) throw new Error("Không tìm thấy vai trò 'admin'");

  try {
    // 1. Tạo tài khoản đăng nhập
    const account = await Account.create({
      userName: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
    });

    // 2. Tạo user và gán vai trò admin
    const user = await User.create({
      ...DEFAULT_ADMIN,
      statusUserId: activeStatus._id,
      roleId: adminRole._id,
      userName: DEFAULT_ADMIN.email,
    });

    // 3. Gắn admin
    const admin = await Admin.create({ _id: user._id });

    console.log(
      `Đã tạo admin mặc định: ${DEFAULT_ADMIN.email}  ${DEFAULT_ADMIN.password}`
    );
  } catch (err) {
    await Account.deleteOne({ userName: DEFAULT_ADMIN.email });
    console.error("Lỗi khi tạo admin mặc định:", err.message);
  }
};
