import axios from "../axios";

//Tạo biến thể sản phẩm (upload nhiều ảnh)
export const apiCreateProductVariation = (formData) =>
  axios({
    url: "/productVariations/",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Lấy toàn bộ biến thể sản phẩm
export const apiGetProductVariations = () =>
  axios({
    url: "/productVariations/",
    method: "get",
  });

//Lấy tất cả biến thể theo productId
export const apiGetVariationsByProductId = (productId) =>
  axios({
    url: `/productVariations/by-product/${productId}`,
    method: "get",
  });

// Lấy một biến thể theo ID
export const apiGetProductVariation = (pvid) =>
  axios({
    url: `/productVariations/${pvid}`,
    method: "get",
  });

// Cập nhật một biến thể (kèm ảnh mới)
export const apiUpdateProductVariation = (pvid, formData) =>
  axios({
    url: `/productVariations/${pvid}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

//  Xoá một biến thể
export const apiDeleteProductVariation = (pvid) =>
  axios({
    url: `/productVariations/${pvid}`,
    method: "delete",
  });

// Upload thêm ảnh cho biến thể (tách riêng upload ảnh)
export const apiUploadImagesToVariation = (pvid, formData) =>
  axios({
    url: `/productVariations/uploadImage/${pvid}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
