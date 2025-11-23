// initAdmin.js
const Account = require("../modules/auth/entities/account.model");
const { registerAdmin } = require("../modules/auth/auth.service");
const { getSystemOwnerId } = require("./systemOwner");

const DEFAULT_ADMIN = {
  firstName: "Admin",
  lastName: "Root",
  dateOfBirth: new Date("1990-01-01"),
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
  phone: process.env.DEFAULT_ADMIN_PHONE,
  accountName: process.env.DEFAULT_ADMIN_ACCOUNT_NAME,
};

/**
 * Hàm khởi tạo admin mặc định (chỉ tạo nếu chưa tồn tại)
 */
async function initDefaultAdmin() {
  try {
    const exists = await Account.findOne({
      accountName: DEFAULT_ADMIN.accountName,
    });

    if (!exists) {
      console.log("Chưa có admin, tiến hành khởi tạo mặc định...");
      await registerAdmin(DEFAULT_ADMIN);
      console.log("Tạo admin mặc định thành công.");
    } else {
      console.log("Admin mặc định đã tồn tại.");
    }

    await getSystemOwnerId();
  } catch (error) {
    console.error(" Lỗi khi khởi tạo admin mặc định:", error);
  }
}

module.exports = { initDefaultAdmin };
