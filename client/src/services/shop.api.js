import axios from "./axios";

export const apiGetShops = (query) =>
  axios({
    url: "shop/profiles/",
    method: "get",
    params: query,
  });

export const apiGetShopCategories = (query) =>
  axios({
    url: "shop/category-shop/",
    method: "get",
    params: query,
  });
