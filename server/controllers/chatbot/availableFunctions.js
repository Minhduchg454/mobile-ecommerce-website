const {
  getCurrentWeather,
  searchProductForChatBot,
} = require("./functioncalling/utilities");

module.exports = {
  search_product: searchProductForChatBot,
  // get_current_temperature: getCurrentWeather,
};
