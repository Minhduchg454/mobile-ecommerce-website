import axios from "../axios";

// ✅ Tạo mới Preview (đánh giá)
export const apiCreatePreview = (data) =>
  axios({
    url: "/preview",
    method: "post",
    data,
  });

// ✅ Lấy danh sách Preview theo userId (truyền qua query)
export const apiGetPreviewsByUser = (userId) =>
  axios({
    url: `/preview`,
    method: "get",
    params: { userId },
  });

// ✅ Cập nhật Preview theo ID
export const apiUpdatePreview = (id, data) =>
  axios({
    url: `/preview/${id}`,
    method: "put",
    data,
  });

// ✅ Xoá Preview theo ID
export const apiDeletePreview = (id) =>
  axios({
    url: `/preview/${id}`,
    method: "delete",
  });

// ✅ Lọc Preview theo các điều kiện: userId, productVariationId, previewRating
export const apiFilterPreviews = (filters) =>
  axios({
    url: `/preview/filter`,
    method: "get",
    params: filters, // { userId, productVariationId, previewRating }
  });
