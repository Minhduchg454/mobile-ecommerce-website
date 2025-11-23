import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetNotifications } from "../../services/notification.api";

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { getState }) => {
    const userId = getState().user.current?._id;
    if (!userId) {
      console.log("fetch thong bao lay userId that bai");
      return [];
    }

    const res = await apiGetNotifications({ userId });
    if (res?.success) {
      return res.notifications.filter((n) => !n.isRead).length;
    }
    return 0;
  }
);

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { getState }) => {
    const userId = getState().user.current?._id;
    if (!userId) {
      console.log("fetch thong bao lay userId that bai");
      return [];
    }
    const res = await apiGetNotifications({ userId });
    return res?.success ? res.notifications : [];
  }
);
