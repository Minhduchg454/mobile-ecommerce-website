// src/apis/statusUser.js

import axios from "../axios";

// ✅ Tạo mới một trạng thái người dùng
export const apiCreateStatusUser = (data) =>
  axios({
    url: "/statususer",
    method: "post",
    data,
  });

// ✅ Lấy toàn bộ trạng thái người dùng
export const apiGetAllStatusUsers = () =>
  axios({
    url: "/statususer",
    method: "get",
  });

// ✅ Cập nhật trạng thái người dùng theo ID
export const apiUpdateStatusUser = (id, data) =>
  axios({
    url: `/statususer/${id}`,
    method: "put",
    data,
  });

// ✅ Xoá trạng thái người dùng theo ID
export const apiDeleteStatusUser = (id) =>
  axios({
    url: `/statususer/${id}`,
    method: "delete",
  });
