// src/apis/address.js
import axios from "../axios";

// Tạo mới địa chỉ
export const apiCreateAddress = (data) =>
  axios({
    url: "/address",
    method: "post",
    data,
  });

// Lấy danh sách địa chỉ theo userId
export const apiGetAddressesByUser = (params) =>
  axios({
    url: "/address",
    method: "get",
    params, // ví dụ: { userId: 'abc123' }
  });

// Lấy chi tiết địa chỉ theo id
export const apiGetSingleAddress = (id) =>
  axios({
    url: `/address/${id}`,
    method: "get",
  });

// Cập nhật địa chỉ theo ID
export const apiUpdateAddress = (id, data) =>
  axios({
    url: `/address/${id}`,
    method: "put",
    data,
  });

// Xóa địa chỉ theo ID
export const apiDeleteAddress = (id) =>
  axios({
    url: `/address/${id}`,
    method: "delete",
  });

//Thiet lập địa chỉ api mặc định
export const apiSetDefaultAddress = (data) =>
  axios({
    url: `/address/setDefault`,
    method: "put",
    data,
  });
