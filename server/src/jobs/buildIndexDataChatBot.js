// jobs/chatbot-index.job.js
const cron = require("node-cron");
const searchService = require("../modules/chatBot/tools/search.tools");

let isRunning = false;

const buildIndex = async () => {
  if (isRunning) return;

  isRunning = true;

  try {
    await searchService.initializeSearch();
  } catch (err) {
    console.error("Lỗi khi xây chỉ mục Chatbot:", err.message || err);
  } finally {
    isRunning = false;
  }
};

exports.startBuildIndexDataChatBot = () => {
  console.log("Khởi động job Chatbot Search Index (mỗi 30 phút)...");
  buildIndex();

  // Tự động mỗi 30 phút
  cron.schedule("*/30 * * * *", () => {
    console.log("Cron job: Đang thực hiện rebuild chỉ mục Chatbot định kỳ...");
    buildIndex();
  });
};
