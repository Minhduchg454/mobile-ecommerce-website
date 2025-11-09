import axios from "./axios";

export const apiCreateVNPayPayment = (data) =>
  axios({
    url: "payments/vnpay/create-payment",
    method: "post",
    data,
  });

export const apiGetPayments = (query) =>
  axios({
    url: "payments/",
    method: "get",
    params: query,
  });
