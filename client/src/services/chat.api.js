// src/api/chat.js
import axios from "./axios"; // axios instance của bạn

export const apiStartConversation = (data) =>
  axios({
    url: "/chats/conversations",
    method: "post",
    data, // { recipientId, userId }
  });

export const apiGetMyConversations = (userId) =>
  axios({
    url: "/chats/conversations/" + userId,
    method: "get",
  });

export const apiGetMessages = (conver_id, query) =>
  axios({
    url: `/chats/conversations/${conver_id}/messages`,
    method: "get",
    params: query,
  });

export const apiSendMessage = (data) =>
  axios({
    url: "/chats/messages",
    method: "post",
    data,
  });

export const apiMarkAsRead = (conver_id, data) =>
  axios({
    url: `/chats/conversations/${conver_id}/read`,
    method: "post",
    data,
  });

export const apiHideConversation = (conver_id, data) =>
  axios({
    url: `/chats/conversations/${conver_id}/hide`,
    method: "put",
    data,
  });
