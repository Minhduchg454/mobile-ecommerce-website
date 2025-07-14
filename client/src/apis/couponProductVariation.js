import axios from "../axios";

// ✅ Tạo liên kết coupon với biến thể sản phẩm
export const apiCreateCouponProductVariation = (data) =>
  axios({
    url: "/couponProductVariations",
    method: "post",
    data,
  });

// ✅ Lấy toàn bộ liên kết coupon - biến thể
export const apiGetCouponProductVariations = (params) =>
  axios({
    url: "/couponProductVariations",
    method: "get",
    params,
  });

// ✅ Cập nhật liên kết theo ID
export const apiUpdateCouponProductVariation = (id, data) =>
  axios({
    url: `/couponProductVariations/${id}`,
    method: "put",
    data,
  });

// ✅ Xoá liên kết theo ID
export const apiDeleteCouponProductVariation = (id) =>
  axios({
    url: `/couponProductVariations/${id}`,
    method: "delete",
  });
