// utilities.js
const searchProduct = require("../../../ultils/searchProduct");
const ResultTypeEnum = require("../ResultTypeEnum");

async function searchProductForChatBot(query) {
  console.log(query);

  const result = await searchProduct(query.query); // trả về danh sách sản phẩm
  if (!Array.isArray(result) || result.length === 0) {
    return {
      suggestions: "❌ Không tìm thấy sản phẩm nào phù hợp với yêu cầu.",
    };
  }

  // console.log("Kết quả trước khi chuyển test: ", result);

  return {
    type: ResultTypeEnum.SEARCH,
    suggestions: result,
  };
}

module.exports = { searchProductForChatBot };
