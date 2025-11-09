// initAdmin.js
const Account = require("../modules/auth/entities/account.model");
const { registerAdmin } = require("../modules/auth/auth.service");

const DEFAULT_ADMIN = {
  firstName: "Admin",
  lastName: "Root",
  dateOfBirth: new Date("1990-01-01"),
  email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
  phone: "0123456789",
  accountName: "0123456789",
};

/**
 * Hàm khởi tạo admin mặc định (chỉ tạo nếu chưa tồn tại)
 */
async function initDefaultAdmin() {
  try {
    const exists = await Account.findOne({
      accountName: DEFAULT_ADMIN.accountName,
    });
    if (exists) {
      console.log("Admin mặc định đã tồn tại:", DEFAULT_ADMIN.accountName);
      return;
    }

    console.log("Chưa có admin, tiến hành khởi tạo mặc định...");
    const result = await registerAdmin(DEFAULT_ADMIN);

    if (result?.success) {
      console.log("Tạo admin mặc định thành công:", DEFAULT_ADMIN.email);
    } else {
      console.error("Tạo admin thất bại:", result?.message || "Không rõ lỗi");
    }
  } catch (error) {
    console.error(" Lỗi khi khởi tạo admin mặc định:", error);
  }
}

module.exports = { initDefaultAdmin };
