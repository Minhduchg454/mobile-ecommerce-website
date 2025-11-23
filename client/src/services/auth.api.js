import axios from "./axios";

export const apiRegisterCustomer = (data) =>
  axios({
    url: "auths/register/customer",
    method: "post",
    data,
    headers: { "Content-Type": "application/json" },
  });

export const apiRegisterShop = (data) =>
  axios({
    url: "auths/register/shop",
    method: "post",
    data,
    headers: { "Content-Type": "application/json" },
  });

export const apiLogin = (data) =>
  axios({
    url: "auths/login",
    method: "post",
    data,
  });

export const apiGoogleLogin = (data) =>
  axios({
    url: "auths/google-login",
    method: "post",
    data,
    headers: { "Content-Type": "application/json" },
  });

export const apiGetCurrent = () =>
  axios({
    url: "/users/current",
    method: "get",
  });

export const apiChangePassword = (data) =>
  axios({
    url: "auths/change-password",
    method: "post",
    data,
    headers: { "Content-Type": "application/json" },
  });
