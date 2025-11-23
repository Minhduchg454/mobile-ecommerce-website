import axios from "./axios";

export const apiGetNotifications = (query) =>
  axios({
    url: "/notifications",
    method: "get",
    params: query,
  });

export const apiDeleteAllNotification = (data) =>
  axios({
    url: "/notifications",
    method: "delete",
    data,
  });

export const apiMarkRead = (data) =>
  axios({
    url: "/notifications/mark-read",
    method: "put",
    data,
  });

export const apiMarkAllRead = (data) =>
  axios({
    url: "/notifications/mark-all-read",
    method: "put",
    data,
  });
