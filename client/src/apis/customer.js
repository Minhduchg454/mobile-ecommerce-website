import axios from "../axios";

// Lấy danh sách tất cả customers (có thể truyền query như ?page=&limit=)
export const apiGetCustomers = (params) =>
  axios({
    url: "/customer/",
    method: "get",
    params,
  });

// Lấy thông tin 1 customer theo id
export const apiGetCustomer = (cid) =>
  axios({
    url: "/customer/" + cid,
    method: "get",
  });

// Tạo mới customer
export const apiCreateCustomer = (data) =>
  axios({
    url: "/customer/",
    method: "post",
    data,
  });

// Cập nhật customer
export const apiUpdateCustomer = (cid, data) =>
  axios({
    url: "/customer/" + cid,
    method: "put",
    data,
  });

// Xoá customer
export const apiDeleteCustomer = (cid) =>
  axios({
    url: "/customer/" + cid,
    method: "delete",
  });

// Kiểm tra email đã tồn tại
export const apiCheckEmailExists = (email) =>
  axios({
    url: "/customer/check-email",
    method: "get",
    params: { email },
  });

// Kiểm tra số điện thoại đã tồn tại
export const apiCheckMobileExists = (mobile) =>
  axios({
    url: "/customer/check-mobile",
    method: "get",
    params: { mobile },
  });

// ✅ Lấy giỏ hàng của customer
export const apiGetCustomerCart = (cid) =>
  axios({
    url: `/customer/${cid}/cart`,
    method: "get",
  });
