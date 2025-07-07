import axios from "../axios";

// Lấy danh sách tất cả thương hiệu
export const apiGetBrands = (params) =>
  axios({
    url: "/brands/",
    method: "get",
    params,
  });

// Tạo mới một thương hiệu
export const apiCreateBrand = (data) =>
  axios({
    url: "/brands/",
    method: "post",
    data,
  });

// Cập nhật thương hiệu theo ID
export const apiUpdateBrand = (bid, data) =>
  axios({
    url: `/brands/${bid}`,
    method: "put",
    data,
  });

// Xoá thương hiệu theo ID
export const apiDeleteBrand = (bid) =>
  axios({
    url: `/brands/${bid}`,
    method: "delete",
  });
