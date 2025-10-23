import axios from "./axios";

/**
 * Cart Item
 */

export const apiCreateCartItem = (data) =>
  axios({
    url: "shopping/cart-item/",
    method: "post",
    data,
  });

export const apiGetCartItems = (cartId) =>
  axios({
    url: "shopping/cart-item/",
    method: "get",
    params: { cartId },
  });

export const apiGetCartItem = (id) =>
  axios({
    url: "shopping/cart-item/" + id,
    method: "get",
  });

export const apiUpdateCartItem = (id, data) =>
  axios({
    url: "shopping/cart-item/" + id,
    method: "put",
    data,
  });

export const apiDeleteCartItem = (id) =>
  axios({
    url: "shopping/cart-item/" + id,
    method: "delete",
  });

export const apiClearCartItems = (cartId) =>
  axios({
    url: "shopping/cart-item/clear",
    method: "get",
    params: { cartId },
  });

export const apiGetCartItemCount = (cartId) =>
  axios({
    url: "shopping/cart-item/count",
    method: "get",
    params: { cartId },
  });

/**
 * WishList
 */
export const apiCreateWishlist = (data) =>
  axios({
    url: "shopping/wishlist",
    method: "post",
    data,
  });

export const apiGetWishlist = () =>
  axios({
    url: `shopping/wishlist`,
  });

export const apiGetWishlistByQuery = (params) =>
  axios({
    url: "shopping/wishlist/search",
    method: "get",
    params,
  });

export const apiDeleteAllWishlistByCustomerId = (params) =>
  axios({
    url: "shopping/wishlist/clear",
    method: "delete",
    params,
  });

// Xóa wishlist theo điều kiện (query: customerId, productVariationId, ...)
export const apiDeleteWishlistByCondition = (params) =>
  axios({
    url: "shopping/wishlist",
    method: "delete",
    params,
  });

export const apiUpdateWishlist = (id, data) =>
  axios({
    url: `shopping/wishlist/${id}`,
    method: "put",
    data,
  });

export const apiDeleteWishlist = (id) =>
  axios({
    url: `/shopping/wishlist/${id}`,
    method: "delete",
  });
