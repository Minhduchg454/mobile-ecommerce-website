import axios from "./axios";

/**
 * Category
 */
export const apiGetProductCategories = (query) =>
  axios({
    url: "catalogs/categories",
    method: "get",
    params: query,
  });

export const apiCreateCategory = (data) =>
  axios({
    url: "catalogs/categories/",
    method: "post",
    data,
  });

export const apiDeleteCategory = (cId) =>
  axios({
    url: `catalogs/categories/${cId}`,
    method: "delete",
  });

export const apiUpdateCategory = (data, cId) =>
  axios({
    url: `catalogs/categories/${cId}`,
    method: "put",
    data,
  });

/**
 * Brands
 */

export const apiGetBrands = (query) =>
  axios({
    url: "catalogs/brands",
    method: "get",
    params: query,
  });

export const apiGetBrandStats = () =>
  axios({
    url: "catalogs/brand-stats",
    method: "get",
  });

export const apiCreateBrand = (data) =>
  axios({
    url: "catalogs/brands",
    method: "post",
    data,
  });

export const apiDeleteBrand = (bId) =>
  axios({
    url: `catalogs/brands/${bId}`,
    method: "delete",
  });

export const apiUpdateBrand = (data, bId) =>
  axios({
    url: `catalogs/brands/${bId}`,
    method: "put",
    data,
  });

/**
 * Theme
 */

export const apiGetThemesWithProducts = () =>
  axios({
    url: "catalogs/theme-with-product",
    method: "get",
  });

export const apiGetThemes = (query) =>
  axios({
    url: "catalogs/themes",
    method: "get",
    params: query,
  });

/**
 * Product
 */

// GET /catalog/product/?productId=
export const apiGetProducts = (query) =>
  axios({
    url: "catalogs/products/",
    method: "get",
    params: query,
  });

export const apiGetShopProductsWithVariations = (query) =>
  axios({
    url: "catalogs/shop-products/",
    method: "get",
    params: query,
  });

export const apiGetProductStats = (shopId) =>
  axios({
    url: `catalogs/products/stats${shopId ? `/${shopId}` : ""}`,
    method: "get",
  });

export const apiGetProductDashboardReport = (params) =>
  axios({
    url: `catalogs/products/dash-board`,
    method: "get",
    params,
  });

export const apiGetProduct = (pId) =>
  axios({
    url: `catalogs/product/${pId}`,
    method: "get",
  });

export const apiCreateProduct = (data) =>
  axios({
    url: "catalogs/product/",
    method: "post",
    data,
  });
export const apiUpdateProduct = (data, pId) =>
  axios({
    url: `catalogs/product/${pId}`,
    method: "put",
    data,
  });
export const apiDeleteProduct = (pId) =>
  axios({
    url: `catalogs/product/${pId}`,
    method: "delete",
  });

/**
 * Product Variation
 */
export const apiGetProductVariation = (pvId) =>
  axios({
    url: `catalogs/product-variation/${pvId}`,
    method: "get",
  });

export const apiGetProductVariations = (query) =>
  axios({
    url: `catalogs/product-variations/`,
    method: "get",
    params: query,
  });

export const apiCreateProductVariation = (data) =>
  axios({
    url: "catalogs/product-variation/",
    method: "post",
    data,
  });

export const apiUpdateProductVariation = (data, pvId) =>
  axios({
    url: `catalogs/product-variation/${pvId}`,
    method: "put",
    data,
  });

export const apiDeleteProductVariation = (pvId) =>
  axios({
    url: `catalogs/product-variation/${pvId}`,
    method: "delete",
  });

/**
 * Shop
 */

export const apiGetShops = (query) =>
  axios({
    url: "shops/profiles/",
    method: "get",
    params: query,
  });
