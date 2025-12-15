// store/chat/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchMyConversations, fetchMessages } from "./asynsAction";

const initialState = {
  conversations: [],
  totalUnreadChat: 0,
  messagesByConverId: {},
  loadingConversations: false,
  loadingMessages: false,
  currentConverId: null,
  isChatOpen: false,
  targetConversationId: null,
  onlineUsers: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChatBox: (state, action) => {
      state.isChatOpen = true;
      state.targetConversationId = action.payload || null;
    },
    closeChatBox: (state) => {
      state.isChatOpen = false;
      state.targetConversationId = null;
    },
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      state.onlineUsers[userId] = isOnline;
    },

    receiveMessage: (state, action) => {
      const msg = action.payload;
      const cid = msg.conver_id?.toString();

      if (!cid) return;

      if (!state.messagesByConverId[cid]) {
        state.messagesByConverId[cid] = [];
      }

      const isExist = state.messagesByConverId[cid].some(
        (m) => m._id === msg._id
      );
      if (!isExist) {
        state.messagesByConverId[cid].push(msg);
      }
    },

    setCurrentConversation: (state, action) => {
      const cid = action.payload;
      state.currentConverId = cid;

      const converItem = state.conversations.find(
        (c) => c.conversation._id === cid
      );
      if (converItem && converItem.unreadCount > 0) {
        state.totalUnreadChat -= converItem.unreadCount;
        converItem.unreadCount = 0;
      }
    },

    updateConversationFromSocket: (state, action) => {
      const { conver_id, lastMessage, unreadCount, isSender } = action.payload;
      if (!conver_id) return;

      let converItem = state.conversations.find(
        (c) => c.conversation._id === conver_id
      );

      // Nếu chưa có → tạo tạm (rất hiếm, nhưng an toàn)
      if (!converItem && lastMessage) {
        state.conversations.unshift({
          conversation: {
            _id: conver_id,
            conver_lastMessageId: lastMessage,
            updatedAt: lastMessage.createdAt || new Date(),
          },
          otherUser: { userName: "Đang tải...", userAvatar: null },
          unreadCount: isSender ? 0 : 1,
        });
        if (!isSender) state.totalUnreadChat += 1;
        return;
      }

      if (!converItem) return;

      // Cập nhật tin nhắn cuối
      if (lastMessage) {
        converItem.conversation.conver_lastMessageId = lastMessage;
        converItem.conversation.updatedAt = lastMessage.createdAt || new Date();
      }

      // Cập nhật unread count
      if (unreadCount !== undefined && unreadCount !== null) {
        const old = converItem.unreadCount || 0;
        state.totalUnreadChat += unreadCount - old;
        converItem.unreadCount = unreadCount;
      } else if (isSender === false) {
        converItem.unreadCount = (converItem.unreadCount || 0) + 1;
        state.totalUnreadChat += 1;
      }

      // Đưa lên đầu
      state.conversations = state.conversations
        .filter((c) => c.conversation._id !== conver_id)
        .concat(converItem);
    },

    clearChatData: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyConversations.pending, (state) => {
        state.loadingConversations = true;
      })
      .addCase(fetchMyConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
        state.totalUnreadChat = action.payload.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0
        );
      })
      .addCase(fetchMyConversations.rejected, (state) => {
        state.loadingConversations = false;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conver_id, messages } = action.payload;
        state.messagesByConverId[conver_id] = messages;
      });
  },
});

export const {
  openChatBox,
  closeChatBox,
  receiveMessage,
  setCurrentConversation,
  updateConversationFromSocket,
  clearChatData,
} = chatSlice.actions;

export default chatSlice.reducer;
