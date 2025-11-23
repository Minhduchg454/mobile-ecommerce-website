// store/notification/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, fetchUnreadCount } from "./asynsAction";

const initialState = {
  unreadCount: 0,
  notifications: [],
  loading: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      });
  },
});

export const { incrementUnread, resetUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
