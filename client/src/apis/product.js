import axios from "../axios";

export const apiGetProducts = (params) =>
  axios({
    url: "/products/",
    method: "get",
    params,
  });
export const apiGetProduct = (pid) =>
  axios({
    url: "/products/" + pid,
    method: "get",
  });
export const apiRatings = (data) =>
  axios({
    url: "/products/rating",
    method: "put",
    data,
  });
export const apiCreateProduct = (data) =>
  axios({
    url: "/products/",
    method: "post",
    data,
  });
export const apiUpdateProduct = (data, pid) =>
  axios({
    url: "/products/" + pid,
    method: "put",
    data,
  });
export const apiDeleteProduct = (pid) =>
  axios({
    url: "/products/" + pid,
    method: "delete",
  });
export const apiAddVarriant = (data, pid) =>
  axios({
    url: "/product/varriant/" + pid,
    method: "put",
    data,
  });
export const apiCreateOrder = (data) =>
  axios({
    url: "/orders/",
    method: "post",
    data,
  });

export const apiGetOrders = (params) =>
  axios({
    url: "/orders",
    method: "get",
    params,
  });

export const apiGetUserOrders = (params) =>
  axios({
    url: "/orders/user",
    method: "get",
    params,
  });

// Huỷ đơn hàng theo ID
export const apiCancelOrder = (orderId) =>
  axios({
    url: `/orders/${orderId}`,
    method: "put",
    data: {
      status: "Cancelled",
    },
  });

//Cap nhat don hang
export const apiUpdateOrder = (orderId, data) =>
  axios({
    url: `/orders/${orderId}`,
    method: "put",
    data,
  });

export const apiUpdateStatus = (oid, data) =>
  axios({
    url: "/order/status/" + oid,
    method: "put",
    data,
  });

export const apiDeleteOrderByAdmin = (oid) =>
  axios({
    url: "/order/admin/" + oid,
    method: "delete",
  });
