import axios from "../axios";

// Lấy danh sách tất cả thương hiệu
export const apiGetBrands = (params) =>
  axios({
    url: "/brand/",
    method: "get",
    params,
  });

// Tạo mới một thương hiệu
export const apiCreateBrand = (data) =>
  axios({
    url: "/brand/",
    method: "post",
    data,
  });

// Cập nhật thương hiệu theo ID
export const apiUpdateBrand = (bid, data) =>
  axios({
    url: `/brand/${bid}`,
    method: "put",
    data,
  });

// Xoá thương hiệu theo ID
export const apiDeleteBrand = (bid) =>
  axios({
    url: `/brand/${bid}`,
    method: "delete",
  });
