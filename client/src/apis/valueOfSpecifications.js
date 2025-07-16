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

//-----------GAN VOI PRODUCT------------

// Tạo mới value gắn với Product (thông số chung)
export const apiCreateValueOfSpecForProduct = (data) =>
  axios({
    url: "/valueOfSpecifications/product",
    method: "post",
    data,
  });

// Lấy tất cả value theo Product ID
export const apiGetValuesByProductId = (productId) =>
  axios({
    url: `/valueOfSpecifications/product/${productId}`,
    method: "get",
  });

// Cập nhật value của Product
export const apiUpdateValueOfSpecForProduct = (id, data) =>
  axios({
    url: `/valueOfSpecifications/product/${id}`,
    method: "put",
    data,
  });

// Xoá value của Product
export const apiDeleteValueOfSpecForProduct = (id) =>
  axios({
    url: `/valueOfSpecifications/product/${id}`,
    method: "delete",
  });
