import axios from "./axios";

export const apiUpdateUser = (data, uId) =>
  axios({
    url: `user/profile/${uId}`,
    method: "put",
    data,
  });

/**
 * Address
 */
export const apiGetAddresses = (query) =>
  axios({
    url: "user/addresses",
    method: "get",
    params: query, // có thể truyền { userId, q, sort } nếu backend hỗ trợ query
  });

export const apiCreateAddress = (data) =>
  axios({
    url: "user/addresses",
    method: "post",
    data, // body chứa thông tin địa chỉ
  });

export const apiUpdateAddress = (data, addressId) =>
  axios({
    url: `user/addresses/${addressId}`,
    method: "put",
    data,
  });

export const apiDeleteAddress = (addressId, userId) =>
  axios({
    url: `user/addresses/${addressId}`,
    method: "delete",
    data: { userId },
  });
