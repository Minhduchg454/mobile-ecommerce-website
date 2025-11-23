// store/chat/asyncAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiGetMyConversations,
  apiGetMessages,
  apiMarkAsRead,
} from "../../services/chat.api"; // hoặc api/chat.js

// 1. Lấy danh sách hội thoại
export const fetchMyConversations = createAsyncThunk(
  "chat/fetchMyConversations",
  async (_, { getState }) => {
    const userId = getState().user.current?._id;
    if (!userId) throw new Error("User not logged in");

    const res = await apiGetMyConversations(userId);
    if (!res?.success) throw new Error("Lấy hội thoại thất bại");
    return res.conversation; // [{ conversation: {}, otherUser: {}, unreadCount: 0 }]
  }
);

// 2. Lấy tin nhắn trong một cuộc trò chuyện
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conver_id, page = 1 }, { getState }) => {
    const userId = getState().user.current?._id;
    if (!userId || !conver_id) throw new Error("Thiếu thông tin");

    const res = await apiGetMessages(conver_id, { page });
    if (!res?.success) throw new Error("Lấy tin nhắn thất bại");
    console.log("Phan hoi res", res);

    return {
      conver_id,
      messages: res.messages,
      hasMore: res.messages.length === 30,
    };
  }
);

// 4. Đánh dấu đã đọc
export const markConversationRead = createAsyncThunk(
  "chat/markAsRead",
  async (conver_id, { getState }) => {
    const userId = getState().user.current?._id;
    const res = await apiMarkAsRead(conver_id, { userId });
    if (!res?.success) throw new Error("Đánh dấu đã đọc thất bại");
    return conver_id;
  }
);
