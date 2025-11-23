// src/components/Chat/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import {
  fetchMyConversations,
  fetchMessages,
  markConversationRead,
} from "../../store/chat/asynsAction";
import {
  setCurrentConversation,
  receiveMessage,
  updateConversationFromSocket,
} from "../../store/chat/chatSlice";
import { apiSendMessage, apiHideConversation } from "../../services/chat.api";
import {
  getSocket,
  joinConversation,
  leaveConversation,
} from "../../ultils/socket";
import moment from "moment";
import "moment/locale/vi";
import noPhoto from "../../assets/avatarDefault.png";
import { CloseButton } from "../../components";
import { useNavigate } from "react-router-dom";
import { showAlert } from "store/app/appSlice";
import { nextAlertId, registerHandlers } from "store/alert/alertBus";
import { ChatBotPanel } from "../chatbot/ChatBotPanel";
import aiAvatar from "../../assets/logoGoCart.png";
moment.locale("vi");

export const Chat = ({ customClose, conversationIdFromProps }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: user } = useSelector((s) => s.user);
  const { conversations, messagesByConverId, loadingConversations } =
    useSelector((s) => s.chat);

  const CHATBOT_ID = "CHATBOT_ID";
  const [selectedId, setSelectedId] = useState(() =>
    conversationIdFromProps ? null : CHATBOT_ID
  );
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  // Load danh sách hội thoại
  useEffect(() => {
    if (user?._id) dispatch(fetchMyConversations());
  }, [dispatch, user]);

  // Tự động chọn hội thoại nếu được truyền từ props
  useEffect(() => {
    if (conversationIdFromProps && conversations.length > 0) {
      const target = conversations.find(
        (c) => c.conversation._id === conversationIdFromProps
      );
      if (target && selectedId !== conversationIdFromProps) {
        handleSelect(conversationIdFromProps);
      }
    }
  }, [conversations, conversationIdFromProps]);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (selectedId !== CHATBOT_ID && chatContainerRef.current) {
      const el = chatContainerRef.current;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messagesByConverId, selectedId]);

  // Xử lý chọn hội thoại
  const handleSelect = async (converId) => {
    setSelectedId(converId);
    if (converId === CHATBOT_ID) {
      dispatch(setCurrentConversation(null));
      return;
    }

    dispatch(setCurrentConversation(converId));
    dispatch(fetchMessages({ conver_id: converId }));
    dispatch(markConversationRead(converId));
  };

  useEffect(() => {
    if (!selectedId || selectedId === CHATBOT_ID) return;

    const socket = getSocket();
    if (!socket?.connected) return;

    joinConversation(selectedId);

    const handleNewMessage = (msg) => {
      dispatch(receiveMessage(msg));
      if (msg.message_senderId?._id !== user?._id) {
        dispatch(markConversationRead(selectedId));
      }
    };

    // XỬ LÝ CẬP NHẬT DANH SÁCH TỪ SOCKET (thay thế fetchMyConversations)
    const handleConversationUpdated = (data) => {
      dispatch(updateConversationFromSocket(data));
    };

    const handleMessageRead = (data) => {
      dispatch(
        updateConversationFromSocket({
          conver_id: data.conver_id,
          unreadCount: 0,
        })
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("message_read", handleMessageRead);
      leaveConversation(selectedId);
    };
  }, [selectedId, user, dispatch]);

  const handleSend = async () => {
    if (!input.trim() || !selectedId || !user?._id) return;
    const content = input.trim();
    setInput("");

    try {
      const res = await apiSendMessage({
        conver_id: selectedId,
        message_content: content,
        message_type: "text",
        userId: user._id,
      });

      if (res?.success && res.populatedMessage) {
        dispatch(receiveMessage(res.populatedMessage));
        // Khi mình gửi → cũng đánh dấu đã đọc (vì mình đang xem)
        dispatch(markConversationRead(selectedId));
      }
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
      setInput(content);
    }
  };

  // Xử lý ẩn hội thoại
  const handleHideConversation = (converId) => {
    const id = nextAlertId();
    registerHandlers(id, {
      onConfirm: async () => {
        const res = await apiHideConversation(converId, { userId: user?._id });
        if (!res.success) {
          dispatch(
            showAlert({
              title: "Lỗi",
              message: res?.message || "Vui lòng thử lại",
              variant: "danger",
            })
          );
        }
        dispatch(fetchMyConversations());
      },
    });
    dispatch(
      showAlert({
        id,
        title: "Xóa chat",
        message: "Hành động này không thể gỡ bỏ. Tiếp tục xóa",
        variant: "danger",
        showCancelButton: true,
        confirmText: "Xóa",
        cancelText: "Huỷ",
      })
    );
  };

  const currentMessages = messagesByConverId[selectedId] || [];
  const currentConver = conversations.find(
    (c) => c.conversation._id === selectedId
  );

  return (
    <div className="w-screen h-screen md:w-[50vw] md:h-[90vh] grid grid-cols-12 bg-white/80 backdrop-blur-md rounded-3xl py-2 md:py-4 border">
      {/* Danh sách hội thoại */}
      <div className="relative h-full min-h-0 col-span-5 border rounded-3xl mx-2 md:mx-4 bg-white/60 backdrop-blur-sm p-2 shadow-md flex flex-col">
        <CloseButton
          className="absolute top-2 left-2"
          onClick={() => (customClose ? customClose() : navigate(`/`))}
        />
        <div className="p-2 text-center font-semibold">Tin nhắn</div>

        <div className="flex-1 overflow-y-auto">
          {/* Chatbot */}
          <div
            onClick={() => handleSelect(CHATBOT_ID)}
            className={`group flex cursor-pointer items-center gap-3 p-2 mb-2 rounded-xl border-b-2 border-blue-100 ${
              selectedId === CHATBOT_ID
                ? "bg-blue-100"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="h-10 w-10 shrink-0 rounded-full border border-blue-500 p-1 bg-white">
              <img
                src={aiAvatar}
                alt="AI"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <div className="flex-1">
              <p className="truncate font-bold text-blue-600">Trợ lý ảo AI</p>
              <p className="truncate text-sm text-gray-500">
                Hỗ trợ giải đáp 24/7
              </p>
            </div>
          </div>

          {/* Danh sách người dùng */}
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((item) => {
              const other = item.otherUser;
              const lastMsg = item.conversation.conver_lastMessageId;
              const isActive = selectedId === item.conversation._id;
              const isUnread = item.unreadCount > 0;

              return (
                <div
                  key={item.conversation._id}
                  onClick={() => handleSelect(item.conversation._id)}
                  className={`group flex cursor-pointer items-center gap-3 p-2 rounded-xl ${
                    isActive ? "bg-blue-300" : "bg-white hover:bg-gray-50"
                  } ${isUnread ? "bg-gray-100" : ""}`}
                >
                  <div className="h-10 w-10 shrink-0 rounded-full border relative bg-white">
                    <img
                      src={other?.userAvatar || noPhoto}
                      alt={other?.userName}
                      className="h-full w-full rounded-full object-contain"
                    />
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <p
                        className={`truncate text-sm ${
                          isUnread ? "font-bold" : "font-medium"
                        }`}
                      >
                        {other?.userName || "Người dùng"}
                      </p>
                      {lastMsg?.createdAt && (
                        <span className="text-xs text-gray-500 shrink-0">
                          {moment(lastMsg.createdAt).fromNow()}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p
                        className={`truncate text-xs ${
                          isUnread
                            ? "font-semibold text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        {isMine(lastMsg, user) ? "Bạn: " : ""}
                        {lastMsg?.message_content || "Chưa có tin nhắn"}
                      </p>
                      <button
                        className="hidden group-hover:block text-xs text-red-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHideConversation(item.conversation._id);
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Nội dung hội thoại */}
      <div className="h-full min-h-0 col-span-7 px-2">
        {!selectedId ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        ) : selectedId === CHATBOT_ID ? (
          <ChatBotPanel />
        ) : (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 p-2 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border border-black bg-white shadow-md">
                  <img
                    src={currentConver?.otherUser?.userAvatar || noPhoto}
                    alt=""
                    className="w-full h-full rounded-full object-contain"
                  />
                </div>
                <div className="-mt-1 bg-white border shadow-md px-2 py-0.5 rounded-2xl text-xs md:text-sm">
                  <p className="font-semibold">
                    {currentConver?.otherUser?.userName || "Người dùng"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tin nhắn */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto scroll-hidden py-4 space-y-4"
            >
              {currentMessages.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có tin nhắn</p>
              ) : (
                currentMessages.map((msg) => {
                  const isMineMsg = isMine(msg, user);
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isMineMsg ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          isMineMsg
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 shadow-md"
                        }`}
                      >
                        {msg.message_content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2 border bg-button-bg rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-button-bg-ac hover:bg-button-bg-hv text-white p-2 rounded-full disabled:opacity-50 transition"
              >
                <ArrowUpIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper
const isMine = (msg, user) => {
  if (!msg || !user) return false;
  const senderId = msg.message_senderId?._id || msg.message_senderId;
  return senderId?.toString() === user._id?.toString();
};
