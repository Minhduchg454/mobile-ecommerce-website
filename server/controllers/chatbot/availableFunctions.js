const { searchProductForChatBot } = require("./functioncalling/searchProduct");

const {
  displayAllProductWithKeyWord,
} = require("./functioncalling/displayAllProductWithKeyWord");

module.exports = {
  search_product: searchProductForChatBot,
  display_all_product_with_key_word: displayAllProductWithKeyWord,
};
