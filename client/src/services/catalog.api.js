import axios from "./axios";

/**
 * Category
 */
export const apiGetProductCategories = (query) =>
  axios({
    url: "catalog/category",
    method: "get",
    params: query,
  });

/**
 * Theme
 */

export const apiGetThemesWithProducts = () =>
  axios({
    url: "catalog/theme-with-product",
    method: "get",
  });

export const apiGetThemes = (query) =>
  axios({
    url: "catalog/themes",
    method: "get",
    params: query,
  });

/**
 * Product
 */

// GET /catalog/product/?productId=
export const apiGetProducts = (query) =>
  axios({
    url: "catalog/products/",
    method: "get",
    params: query,
  });

// GET /catalog/product/:pId
export const apiGetProduct = (pId) =>
  axios({
    url: `catalog/product/${pId}`,
    method: "get",
  });

export const apiCreateProduct = (data) =>
  axios({
    url: "catalog/product/",
    method: "post",
    data,
  });
export const apiUpdateProduct = (data, pId) =>
  axios({
    url: `catalog/product/:${pId}`,
    method: "put",
    data,
  });
export const apiDeleteProduct = (pId) =>
  axios({
    url: `catalog/product/:${pId}`,
    method: "delete",
  });

/**
 * Product Variation
 */
export const apiGetProductVariation = (pvId) =>
  axios({
    url: `catalog/product-variation/${pvId}`,
    method: "get",
  });

export const apiGetProductVariations = (query) =>
  axios({
    url: `catalog/product-variations/`,
    method: "get",
    params: query,
  });

/**
 * Shop
 */

export const apiGetShops = (query) =>
  axios({
    url: "shop/profiles/",
    method: "get",
    params: query,
  });

/**
 * Brands
 */

export const apiGetBrands = (query) =>
  axios({
    url: "catalog/brands/",
    method: "get",
    params: query,
  });
