const { default: mongoose } = require("mongoose");
//const ProductVariation = require("../models/product/ProductVariation");

mongoose.set("strictQuery", false);
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    if (conn.connection.readyState === 1) {
      console.log("DB connection is successfully!");
      // Nếu có lỗi duplicate key liên quan đến index, hãy bỏ comment dòng dưới để đồng bộ lại index
      /*    await ProductVariation.syncIndexes();
      console.log("Đã đồng bộ index"); */
    } else console.log("DB connecting");
  } catch (error) {
    console.log("DB connection is failed");
    throw new Error(error);
  }
};

module.exports = dbConnect;
// đã chạy cap nhat moi
