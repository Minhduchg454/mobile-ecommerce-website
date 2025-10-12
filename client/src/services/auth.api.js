import axios from "./axios";

export const apiRegisterCustomer = (data) =>
  axios({
    url: "auth/register/customer",
    method: "post",
    data,
    headers: { "Content-Type": "application/json" },
  });

export const apiLogin = (data) =>
  axios({
    url: "auth/login",
    method: "post",
    data,
  });

export const apiGoogleLogin = (data) =>
  axios({
    url: "auth/google-login",
    method: "post",
    data,
  });

export const apiGetCurrent = () =>
  axios({
    url: "/user/current",
    method: "get",
  });
