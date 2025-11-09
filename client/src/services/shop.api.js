import axios from "./axios";

//-----------------Shop --------------------
export const apiGetShops = (query) =>
  axios({
    url: "shops/profiles/",
    method: "get",
    params: query,
  });

export const apigetShopDashboardStats = (query) =>
  axios({
    url: "shops/profiles/dash-board",
    method: "get",
    params: query,
  });

export const apiUpdateShop = (data, userId) =>
  axios({
    url: "shops/profile/" + userId,
    method: "put",
    data,
  });

export const apiDeleteShop = (userId) =>
  axios({
    url: "shops/profile/" + userId,
    method: "delete",
  });

//-----------------Shop Categrory --------------------
export const apiGetShopCategories = (query) =>
  axios({
    url: "shops/category-shop/",
    method: "get",
    params: query,
  });

export const apiDeleteShopCategory = (csId) =>
  axios({
    url: "shops/category-shop/" + csId,
    method: "delete",
  });

export const apiUpdateShopCategory = (data, csId) =>
  axios({
    url: "shops/category-shop/" + csId,
    method: "put",
    data,
  });

export const apiCreateShopCategory = (data) =>
  axios({
    url: "shops/category-shop/",
    method: "post",
    data,
  });

//----------------ServicePlan--------------------
export const apiGetServicePlans = (query) =>
  axios({
    url: "shops/service-plans/",
    method: "get",
    params: query,
  });

export const apiDeleteServicePlan = (sId) =>
  axios({
    url: "shops/service-plans/" + sId,
    method: "delete",
  });

export const apiUpdateServicePlan = (data, sId) =>
  axios({
    url: "shops/service-plans/" + sId,
    method: "put",
    data,
  });

export const apiCreateServicePlan = (data) =>
  axios({
    url: "shops/service-plans/",
    method: "post",
    data,
  });

//-------------ShopSubscrible------------

export const apiCreateSubscription = (data) =>
  axios({
    url: "shops/subscribles/",
    method: "post",
    data,
  });

export const apigetSubscriptionsByShop = (shopId) =>
  axios({
    url: "shops/subscribles/" + shopId,
    method: "get",
  });

export const apiCancelSubscription = (subId) =>
  axios({
    url: "shops/subscribles/cancel" + subId,
    method: "post",
  });
