// testSearch.js
const mongoose = require("mongoose");
require("dotenv").config();
const searchProductById = require("./ultils/searchProductByIds");

// Kết nối database
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/your-db-name",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(async () => {
    console.log("Đã kết nối MongoDB");

    const sampleVariationIds = [
      "687145d2d39eff05f032c6de", // thay bằng id thật trong DB của bạn
      "686207de0deead23bc1269fe",
    ];
    const query = "samsung 8Gb";

    const result = await searchProductById(sampleVariationIds, query);

    const util = require("util");
    console.log("🔍 Kết quả tìm kiếm:");
    console.log(util.inspect(result, { depth: null, colors: true }));

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
  });
