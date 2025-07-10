import axios from "../axios";

// ✅ Tạo mới một vai trò
export const apiCreateRole = (data) =>
  axios({
    url: "/role",
    method: "post",
    data,
  });

// ✅ Lấy toàn bộ vai trò
export const apiGetAllRoles = () =>
  axios({
    url: "/role",
    method: "get",
  });

// ✅ Cập nhật vai trò theo ID
export const apiUpdateRole = (id, data) =>
  axios({
    url: `/role/${id}`,
    method: "put",
    data,
  });

// ✅ Xoá vai trò theo ID
export const apiDeleteRole = (id) =>
  axios({
    url: `/role/${id}`,
    method: "delete",
  });
