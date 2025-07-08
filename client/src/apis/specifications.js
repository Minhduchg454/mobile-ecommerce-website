import axios from "../axios";

// ✅ Tạo mới Specification
export const apiCreateSpecification = (data) =>
  axios({
    url: "/specifications",
    method: "post",
    data,
  });

// ✅ Lấy danh sách Specification
export const apiGetSpecifications = () =>
  axios({
    url: "/specifications",
    method: "get",
  });

// ✅ Cập nhật Specification theo ID
export const apiUpdateSpecification = (id, data) =>
  axios({
    url: `/specifications/${id}`,
    method: "put",
    data,
  });

// ✅ Xoá Specification theo ID
export const apiDeleteSpecification = (id) =>
  axios({
    url: `/specifications/${id}`,
    method: "delete",
  });
