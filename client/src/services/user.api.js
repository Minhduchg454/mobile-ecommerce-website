import axios from "./axios";

export const apiUpdateUser = (data, uId) =>
  axios({
    url: `users/profile/${uId}`,
    method: "put",
    data,
  });

export const apiGetUsers = (query) =>
  axios({
    url: "users/profiles",
    method: "get",
    params: query,
  });

export const apiDeleteUser = (uId) =>
  axios({
    url: "users/profiles/" + uId,
    method: "delete",
  });

/**
 * Address
 */
export const apiGetAddresses = (query) =>
  axios({
    url: "users/addresses",
    method: "get",
    params: query,
  });

export const apiCreateAddress = (data) =>
  axios({
    url: "users/addresses",
    method: "post",
    data,
  });

export const apiUpdateAddress = (data, addressId) =>
  axios({
    url: `users/addresses/${addressId}`,
    method: "put",
    data,
  });

export const apiDeleteAddress = (addressId, userId) =>
  axios({
    url: `users/addresses/${addressId}`,
    method: "delete",
    data: { userId },
  });

/**
 * Bank
 */
export const apiGetBank = (query) =>
  axios({
    url: "users/banks",
    method: "get",
    params: query,
  });

/**
 * PaymentAccount
 */
export const apiGetPaymentAccounts = (query) =>
  axios({
    url: "users/payment-accounts",
    method: "get",
    params: query,
  });

export const apiCreatePaymentAccount = (data) =>
  axios({
    url: "users/payment-accounts",
    method: "post",
    data,
  });

export const apiUpdatePaymentAccount = (data, aId) =>
  axios({
    url: `users/payment-accounts/${aId}`,
    method: "put",
    data,
  });

export const apiDeletePaymentAccount = (userId, aId) =>
  axios({
    url: `users/payment-accounts/${aId}`,
    method: "delete",
    data: { userId },
  });

/**
 * Banlance
 */

export const apiGetCurrentUserBalanceByFor = (query) =>
  axios({
    url: "users/balances",
    method: "get",
    params: query,
  });

export const apiUpdateBalance = (data, userId) =>
  axios({
    url: "users/balances/" + userId,
    method: "put",
    data,
  });

/**
 * Transaction
 */
export const apiGetTransactions = (query) =>
  axios({
    url: "users/transactions",
    method: "get",
    params: query,
  });

export const apiGetTransactionDetail = (tId) =>
  axios({
    url: "users/transactions" + tId,
    method: "get",
  });
