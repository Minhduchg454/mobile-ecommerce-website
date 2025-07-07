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
    url: "/order/",
    method: "post",
    data,
  });
export const apiGetOrders = (params) =>
  axios({
    url: "/order/admin",
    method: "get",
    params,
  });
export const apiGetUserOrders = (params) =>
  axios({
    url: "/order/",
    method: "get",
    params,
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
