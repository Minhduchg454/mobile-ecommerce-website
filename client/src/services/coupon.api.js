import axios from "./axios";
// ====================== COUPON ======================

// Lấy danh sách coupon (GET /coupons)
export const apiGetCoupons = (query) =>
  axios({
    url: "coupons/",
    method: "get",
    params: query, // ?isActive=true&usable=true
  });

// Lấy chi tiết coupon theo code (GET /coupons/code/:code)
export const apiGetCouponByCode = (couponCode) =>
  axios({
    url: `coupons/code/${couponCode}`,
    method: "get",
  });

// Tạo coupon mới (POST /coupons)
export const apiCreateCoupon = (data) =>
  axios({
    url: "coupons/",
    method: "post",
    data,
  });

// Cập nhật coupon (PATCH /coupons/:id)
export const apiUpdateCoupon = (id, data) =>
  axios({
    url: `coupons/${id}`,
    method: "put",
    data,
  });

// Xoá coupon (DELETE /coupons/:id)
export const apiDeleteCoupon = (id) =>
  axios({
    url: `coupons/${id}`,
    method: "delete",
  });
