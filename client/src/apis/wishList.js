// src/apis/wishlist.js
import axios from "../axios";

// Tạo mới một mục yêu thích
export const apiCreateWishlist = (data) =>
  axios({
    url: "/wishlist",
    method: "post",
    data,
  });

// Lấy chi tiết wishlist theo id
export const apiGetWishlist = (id) =>
  axios({
    url: `/wishlist/${id}`,
    method: "get",
  });

// Cập nhật wishlist theo id
export const apiUpdateWishlist = (id, data) =>
  axios({
    url: `/wishlist/${id}`,
    method: "put",
    data,
  });

// Xóa wishlist theo id
export const apiDeleteWishlist = (id) =>
  axios({
    url: `/wishlist/${id}`,
    method: "delete",
  });

// Lấy toàn bộ wishlist theo query
export const apiGetWishlistByQuery = (params) =>
  axios({
    url: "/wishlist",
    method: "get",
    params,
  });

// Xóa wishlist theo điều kiện (query: customerId, productVariationId, ...)
export const apiDeleteWishlistByCondition = (params) =>
  axios({
    url: "/wishlist/byCondition",
    method: "delete",
    params,
  });
