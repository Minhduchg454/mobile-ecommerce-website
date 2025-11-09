import axios from "./axios";

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

export const apiGetOrdersByCustomer = (cId, params) =>
  axios({
    url: "/orders/customers/" + cId,
    method: "get",
    params,
  });

export const apiGetOrdersByShop = (shopId, params) =>
  axios({
    url: "/orders/shops/" + shopId,
    method: "get",
    params,
  });

export const apiUpdateOrders = (orderId, data) =>
  axios({
    url: `/orders/${orderId}`,
    method: "put",
    data,
  });

export const apiGetOrderCountsByStatus = (params) =>
  axios({
    url: "/orders/count-by-status",
    method: "get",
    params,
  });

export const apiGetOrderDashboardStats = (params) =>
  axios({
    url: "/orders/dash-board",
    method: "get",
    params,
  });
