// utilities.js
// const { Query } = require("mongoose");
const searchProduct = require("../../../ultils/searchProduct");
const ResultTypeEnum = require("../ResultTypeEnum");

async function displayAllProductWithKeyWord(query) {
  console.log(query);

  const result = await searchProduct(query.query); // trả về danh sách sản phẩm
  if (!Array.isArray(result) || result.length === 0) {
    return {
      suggestions: "❌ Không tìm thấy sản phẩm nào phù hợp với yêu cầu.",
    };
  }

  console.log("displayAllProductWithKeyWord: ", result);

  return {
    type: ResultTypeEnum.DISPLAY,
    suggestions: result,
  }; // bọc text trong object để tương thích với Gemini
}

module.exports = { displayAllProductWithKeyWord };
