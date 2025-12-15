// src/utils/socket.js
import { io } from "socket.io-client";
import { store } from "../store/redux";
import { incrementUnread } from "../store/notification/notificationSlice";
import { updateConversationFromSocket } from "../store/chat/chatSlice";

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return;

  const user = store.getState().user.current;
  if (!user?._id) return;

  const SOCKET_URL = process.env.REACT_APP_SERVER || "http://localhost:5001";

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("WebSocket connected:", socket.id);
    socket.emit("authenticate", { userId });
  });

  // Notification (giữ lại)
  socket.on("new_notification", (data) => {
    if (data.recipientId === userId) {
      store.dispatch(incrementUnread());
    }
  });

  socket.on("update_unread_count", () => {
    store.dispatch({ type: "notification/fetchUnreadCount" });
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });

  socket.on("conversation_updated", (data) => {
    store.dispatch(updateConversationFromSocket(data));
  });

  socket.on("message_read", (data) => {
    store.dispatch(
      updateConversationFromSocket({
        conver_id: data.conver_id,
        unreadCount: 0,
      })
    );
  });

  socket.on("user_online_status", (data) => {
    store.dispatch({
      type: "chat/updateUserOnlineStatus",
      payload: data,
    });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conver_id) => {
  socket?.emit("join_conversation", { conver_id });
};

export const leaveConversation = (conver_id) => {
  socket?.emit("leave_conversation", { conver_id });
};

export const getSocket = () => socket;
