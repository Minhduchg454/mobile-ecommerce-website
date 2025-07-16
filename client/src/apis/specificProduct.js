import axios from "../axios";

// Tạo mới sản phẩm cụ thể
export const apiCreateSpecificProduct = (data) =>
  axios({
    url: "/specificProducts",
    method: "post",
    data,
  });

// Lấy tất cả sản phẩm cụ thể
export const apiGetSpecificProducts = () =>
  axios({
    url: "/specificProducts",
    method: "get",
  });

// Lấy chi tiết một sản phẩm cụ thể theo ID
export const apiGetSpecificProduct = (spid) =>
  axios({
    url: `/specificProducts/${spid}`,
    method: "get",
  });

// Lấy tất cả sản phẩm cụ thể theo ID biến thể
export const apiGetSpecificProductsByVariationId = (pvid) =>
  axios({
    url: `/specificProducts/variation/${pvid}`,
    method: "get",
  });

// Cập nhật một sản phẩm cụ thể theo ID
export const apiUpdateSpecificProduct = (spid, data) =>
  axios({
    url: `/specificProducts/${spid}`,
    method: "put",
    data,
  });

// Xoá một sản phẩm cụ thể theo ID
export const apiDeleteSpecificProduct = (spid) =>
  axios({
    url: `/specificProducts/${spid}`,
    method: "delete",
  });
