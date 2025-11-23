// src/utils/systemOwner.js
const Account = require("../modules/auth/entities/account.model");

let cachedSystemId = null;

const getSystemOwnerId = async () => {
  if (cachedSystemId) {
    return cachedSystemId;
  }

  console.log("🔍 Đang tìm ID Admin hệ thống từ Database...");

  const admin = await Account.findOne({
    accountName: process.env.DEFAULT_ADMIN_ACCOUNT_NAME,
  }).select("userId");

  if (!admin) {
    throw new Error(
      "LỖI NGHIÊM TRỌNG: Không tìm thấy Admin hệ thống để nhận tiền!"
    );
  }

  cachedSystemId = admin.userId.toString();
  console.log("Đã cache System ID:", cachedSystemId);

  return cachedSystemId;
};

module.exports = { getSystemOwnerId };
