// utilities.js
// const { Query } = require("mongoose");
const searchProductByIds = require("../../../ultils/searchProductByIds");
const ResultTypeEnum = require("../ResultTypeEnum");

async function displayProductWithIds(query) {
  console.log(displayProductWithIds, query);

  const result = await searchProductByIds(query.variationIds); // trả về danh sách sản phẩm
  if (!Array.isArray(result) || result.length === 0) {
    return {
      suggestions: "❌ Không tìm thấy sản phẩm nào phù hợp với yêu cầu.",
    };
  }

  console.log(displayProductWithIds, result);

  return {
    type: ResultTypeEnum.DISPLAY,
    suggestions: result,
  }; // bọc text trong object để tương thích với Gemini
}

module.exports = { displayProductWithIds };
