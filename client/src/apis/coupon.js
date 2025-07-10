// src/apis/coupon.js
import axios from "../axios";

//Tạo mới mã giảm giá
export const apiCreateCoupon = (data) =>
  axios({
    url: "/coupons",
    method: "post",
    data,
  });

// Lấy tất cả mã giảm giá
export const apiGetAllCoupons = () =>
  axios({
    url: "/coupons",
    method: "get",
  });

// Lấy thông tin mã giảm giá theo id hoặc code
export const apiGetSingleCoupon = (params) =>
  axios({
    url: "/coupons/single",
    method: "get",
    params, // ví dụ: { id: 'abc123' } hoặc { code: 'SALE20' }
  });

// Cập nhật mã giảm giá theo ID
export const apiUpdateCoupon = (id, data) =>
  axios({
    url: `/coupons/${id}`,
    method: "put",
    data,
  });

// Xoá mã giảm giá theo ID
export const apiDeleteCoupon = (id) =>
  axios({
    url: `/coupons/${id}`,
    method: "delete",
  });
