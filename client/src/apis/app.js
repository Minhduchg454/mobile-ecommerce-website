import axios from "../axios";

export const apiGetCategories = () =>
  axios({
    url: "/productCategory/",
    method: "get",
  });
export const apiGetDashboard = (params) =>
  axios({
    url: "/order/dashboard",
    method: "get",
    params,
  });
