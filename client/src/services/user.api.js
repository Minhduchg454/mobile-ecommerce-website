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
    params: query, // có thể truyền { userId, q, sort } nếu backend hỗ trợ query
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
