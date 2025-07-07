import axios from "../axios";

// Tạo mới một giá trị thông số kỹ thuật (value)
export const apiCreateValueOfSpec = (data) =>
  axios({
    url: "/valueOfSpecifications/",
    method: "post",
    data,
  });

// Lấy tất cả giá trị thông số kỹ thuật
export const apiGetAllValuesOfSpecs = () =>
  axios({
    url: "/valueOfSpecifications/",
    method: "get",
  });

// Lấy các value theo variationId
export const apiGetValuesByVariationId = (variationId) =>
  axios({
    url: `/valueOfSpecifications/variation/${variationId}`,
    method: "get",
  });

// Cập nhật một value
export const apiUpdateValueOfSpec = (id, data) =>
  axios({
    url: `/valueOfSpecifications/${id}`,
    method: "put",
    data,
  });

// Xoá một value
export const apiDeleteValueOfSpec = (id) =>
  axios({
    url: `/valueOfSpecifications/${id}`,
    method: "delete",
  });
