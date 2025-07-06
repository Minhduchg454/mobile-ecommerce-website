import axios from "../axios";

// ✅ Tạo mới một danh mục sản phẩm
export const apiCreateProductCategory = (data) =>
  axios({
    url: "/productCategories",
    method: "post",
    data,
  });

// ✅ Lấy toàn bộ danh mục sản phẩm
export const apiGetAllProductCategories = () =>
  axios({
    url: "/productCategories",
    method: "get",
  });

// Lấy danh mục theo tên (trả về ID)
export const apiGetCategoryIdByName = (productCategoryName) =>
  axios({
    url: `/productCategories/by-name?productCategoryName=${productCategoryName}`,
    method: "get",
  });

// Cập nhật danh mục theo ID
export const apiUpdateProductCategory = (id, data) =>
  axios({
    url: `/productCategories/${id}`,
    method: "put",
    data,
  });

// Xoá danh mục theo ID
export const apiDeleteProductCategory = (id) =>
  axios({
    url: `/productCategories/${id}`,
    method: "delete",
  });
