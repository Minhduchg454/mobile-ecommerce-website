// utilities.js
const searchProductByIds = require("../../../ultils/searchProductByIds");
const ResultTypeEnum = require("../ResultTypeEnum");

async function searchProductForChatBotByIds(query) {
  console.log(query);
  console.log("chat bot gọi hàm: ", searchProductForChatBotByIds);
  const result = await searchProductByIds(query.variationIds); // trả về danh sách sản phẩm
  if (!Array.isArray(result) || result.length === 0) {
    return {
      suggestions: "❌ Không tìm thấy sản phẩm nào phù hợp với yêu cầu.",
    };
  }

  console.log(searchProductForChatBotByIds, result);

  return {
    type: ResultTypeEnum.SEARCH,
    suggestions: result,
  };
}

module.exports = { searchProductForChatBotByIds };
