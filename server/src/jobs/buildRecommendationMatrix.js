const cron = require("node-cron");
const RecommendationService = require("../modules/recommenderSystem/recommenderSystem.service");

exports.startRecommendationJob = () => {
  console.log("Khởi động job xây ma trận gợi ý (mỗi 6 tiếng)...");

  // Chạy ngay lần đầu khi server khởi động
  RecommendationService.buildUserItemMatrix()
    .then(() => {})
    .catch((err) => console.error("Lỗi lần đầu xây ma trận:", err));

  // Sau đó tự động mỗi 6 tiếng
  cron.schedule("0 */5 * * *", async () => {
    console.log("Bắt đầu xây lại ma trận gợi ý (cron job)...");
    try {
      await RecommendationService.buildUserItemMatrix();
    } catch (err) {
      console.error("Lỗi cron job xây ma trận:", err);
    }
  });

  console.log("Cron job gợi ý đã được lên lịch: mỗi 5 tiếng");
};
