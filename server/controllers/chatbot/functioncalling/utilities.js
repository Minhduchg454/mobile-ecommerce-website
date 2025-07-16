// utilities.js
// const { Query } = require("mongoose");
const searchProduct = require("../../../ultils/searchProduct");

async function searchProductForChatBot(query) {
  console.log(query);

  const result = await searchProduct(query.query); // trả về danh sách sản phẩm
  if (!Array.isArray(result) || result.length === 0) {
    return {
      suggestions: "❌ Không tìm thấy sản phẩm nào phù hợp với yêu cầu.",
    };
  }

  console.log("Kết quả trước khi chuyển test: ", result);

  return { suggestions: result }; // bọc text trong object để tương thích với Gemini
}

module.exports = { searchProductForChatBot };
