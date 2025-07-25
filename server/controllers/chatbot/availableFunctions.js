const { searchProductForChatBot } = require("./functioncalling/searchProduct");

const {
  displayAllProductWithKeyWord,
} = require("./functioncalling/displayAllProductWithKeyWord");

const {
  searchProductForChatBotByIds,
} = require("./functioncalling/searchProductByIds");

const {
  displayProductWithIds,
} = require("./functioncalling/displayProductWithIds");

module.exports = {
  search_product: searchProductForChatBot,
  display_all_product_with_key_word: displayAllProductWithKeyWord,
  search_product_by_ids: searchProductForChatBotByIds,
  display_product_with_ids: displayProductWithIds,
};
