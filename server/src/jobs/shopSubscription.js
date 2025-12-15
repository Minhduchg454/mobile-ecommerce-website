const cron = require("node-cron");
const shopService = require("../modules/shop/shop.service");
let isRunning = false;

const runSubscriptionCheck = async () => {
  if (isRunning) {
    console.log("[ShopJob] Job đang chạy, bỏ qua lần kích hoạt này.");
    return;
  }
  isRunning = true;

  try {
    await shopService.scanAndSyncExpiredSubscriptions();
  } catch (err) {
    console.error("[ShopJob] Lỗi không mong muốn:", err.message || err);
  } finally {
    isRunning = false;
  }
};

exports.startSubscriptionJob = () => {
  console.log("Khởi động job Shop Subscription Check (mỗi 30 phút)...");
  runSubscriptionCheck();

  // Lên lịch: Mỗi 1h chạy 1 lần
  cron.schedule("*/0 * * * *", () => {
    console.log("[ShopJob] Cron: Đang kiểm tra gói dịch vụ hết hạn...");
    runSubscriptionCheck();
  });
};
