// src/components/Chat/ChatBotPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { GrPowerReset } from "react-icons/gr";
import { useSelector } from "react-redux";
import { marked } from "marked";

// Import các component hiển thị
import { ProductCard, OrderCard1 } from "../../components";
import { apiGetResponse } from "../../services/chatBot.api";
import { ResultTypeEnum } from "./ResultTypeEnum";
import { APP_INFO } from "../../ultils/contants";
import aiAvatar from "../../assets/logoGoCart.png";

const initialMessages = [
  {
    role: "bot",
    type: ResultTypeEnum.TEXT,
    text: `Chào mừng Anh/Chị đến với sàn điện tử ${APP_INFO.NAME} !`,
  },
  {
    role: "bot",
    type: ResultTypeEnum.TEXT,
    text: `Em sẳn sàng hỗ trợ Anh/Chị ạ`,
  },
];

export const ChatBotPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const { current } = useSelector((state) => state.user);

  // Khởi tạo tin nhắn ngay khi mount (Logic gốc)
  useEffect(() => {
    setMessages(initialMessages);
  }, [current]);

  // Scroll mượt đến tin nhắn mới nhất (Logic gốc - dùng setTimeout để đảm bảo DOM đã render)
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Reset chat
  const handleResetChat = () => {
    setMessages(initialMessages);
    setInput("");
    setIsLoading(false);
  };

  // Gửi tin nhắn (Logic gốc)
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      text: input.trim(),
      type: ResultTypeEnum.TEXT,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiGetResponse({
        message: userMessage.text,
        history: messages,
        userId: current?._id,
        roles: current?.roles || [],
      });

      const newBotMessages = res.responseContent.map((item) => {
        if (item.type === ResultTypeEnum.DISPLAY) {
          return {
            role: "bot",
            type: ResultTypeEnum.DISPLAY,
            information: item.information,
            data: item.data,
            displayType: item.displayType,
          };
        }
        return {
          role: "bot",
          type: ResultTypeEnum.TEXT,
          text: item.text,
        };
      });

      setMessages((prev) => [...prev, ...newBotMessages]);
    } catch (error) {
      console.error("Lỗi gửi:", error);
      const errorMessage = {
        role: "bot",
        type: ResultTypeEnum.TEXT,
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-3xl relative">
      <div className="flex-1 overflow-y-auto scroll-hidden rounded-3xl">
        <div className="sticky top-0 z-10 p-2 rounded-t-3xl flex items-center justify-center ">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-black bg-white shadow-md p-1">
              <img
                src={aiAvatar}
                alt="Admin avatar"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="-mt-1 flex flex-col items-center justify-center bg-white shadow-md text-black px-2 py-0.5 rounded-2xl -z-10">
              <p className="font-semibold text-sm text-center">Trợ lý AI</p>
            </div>
          </div>
        </div>

        {/* Messages List (Logic render gốc) */}
        <div className="px-2 py-3 flex flex-col space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex h-fit ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.type === ResultTypeEnum.DISPLAY ? (
                <div className="w-full space-y-3">
                  {/* Thông tin mô tả */}
                  {msg.information && (
                    <div className="px-3 py-1 rounded-xl bg-gray-100 text-sm text-gray-800 border">
                      <div
                        style={{ whiteSpace: "pre-line" }}
                        dangerouslySetInnerHTML={{
                          __html: marked(msg.information),
                        }}
                      />
                    </div>
                  )}

                  {/* Render theo loại */}
                  <div className="space-y-4">
                    {msg.displayType === ResultTypeEnum.DISPLAY_PRODUCT && (
                      <div className="flex flex-wrap w-[80%] gap-3">
                        {msg.data.map((product, i) => (
                          <ProductCard
                            key={i}
                            {...product}
                            className="w-[150px] h-[260px]"
                            imageHeight="h-[100px]"
                          />
                        ))}
                      </div>
                    )}

                    {msg.displayType ===
                      ResultTypeEnum.DISPLAY_ORDER_DETAIL && (
                      <div className="flex flex-wrap w-[80%] gap-3">
                        <OrderCard1
                          order={msg.data[0] || msg.data}
                          currentUser={current}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`px-3 py-1 rounded-xl text-sm max-w-[85%] border ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                  dangerouslySetInnerHTML={{ __html: marked(msg.text) }}
                />
              )}
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Đang phản hồi...</span>
              </div>
            </div>
          )}

          {/* Scroll Anchor */}
          <div ref={bottomRef} />
        </div>
      </div>
      {/* END SCROLL CONTAINER */}

      {/* Input - Sticky bottom (Logic render gốc) */}
      <div className="sticky bottom-0 z-20 flex gap-2 w-full pt-3 items-center ">
        <button
          onClick={handleResetChat}
          className="border bg-button-bg hover:bg-button-hv rounded-full p-2"
        >
          <GrPowerReset className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          className="flex-1 px-4 py-2 border bg-button-bg rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Hỏi bất kì điều gì..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="bg-button-bg-ac hover:bg-button-bg-hv text-white p-2 rounded-full disabled:opacity-50 transition"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
