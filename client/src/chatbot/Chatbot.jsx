import { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import ProductCard from "./component/ProductCard";

import { ResultTypeEnum } from "./ResultTypeEnum";
import { apiSendMessageToChatbot } from "apis/chatbot";
const BASE_URL = "http://localhost:3000/";

function addDomainToRelativeLinks(text) {
  return text.replace(
    /(?<!https?:\/\/)(\b(?:dien-thoai|phu-kien-dien-thoai)[^\s)]+)/g,
    (match) => {
      // Nếu link đã chứa BASE_URL thì giữ nguyên
      if (match.startsWith(BASE_URL)) return match;
      return `${BASE_URL}${match}`;
    }
  );
}

function formatTextWithLinks(text) {
  const withFullLinks = addDomainToRelativeLinks(text);
  return withFullLinks.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">Xem chi tiết</a>`
  );
}

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    setMessages([
      { role: "bot", text: "Chào mừng bạn đến với cửa hàng FONE!" },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    console.log("Hi 1");
    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await apiSendMessageToChatbot({
        message: userMessage.text,
        history: messages,
      });
      console.log(res.responseContent);
      const newBotMessages = res.responseContent.map((item) => {
        if (item.type === ResultTypeEnum.DISPLAY) {
          return {
            role: "bot",
            type: ResultTypeEnum.DISPLAY,
            information: item.information,
            data: item.data, // dữ liệu sản phẩm
          };
        } else {
          return {
            role: "bot",
            type: ResultTypeEnum.TEXT,
            text: formatTextWithLinks(item.text),
          };
        }
      });

      setMessages((prev) => [...prev, ...newBotMessages]);
    } catch (error) {
      console.error("Lỗi gửi:", error);
      const errorMessage = {
        role: "bot",
        text: "Xin lỗi, đã có lỗi xảy ra.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="fixed bottom-20 right-10 z-50">
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-2">
        {!open && showIntro && (
          <div className="relative bg-white/60 border backdrop-blur-md border-gray-300 shadow-md px-3 py-2 rounded-lg text-sm text-gray-800 max-w-[500px]">
            <button
              onClick={() => {
                setShowIntro(false);
              }}
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <div>
              <p> Xin chào anh/chị! </p>
              <p>
                Em là trợ lý AI của cửa hàng{" "}
                <span className="font-semibold text-blue-600">FONE</span>{" "}
              </p>
            </div>
          </div>
        )}

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="bg-white/60 border backdrop-blur-md hover:bg-blue-400  border-gray-300 hover:shadow-xl text-blue-700 p-3 rounded-full shadow-xl focus:outline-none transition duration-200"
          >
            <ChatBubbleLeftRightIcon className="w-8 h-8" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="
            fixed bottom-0 right-0 left-0 top-0
            md:bottom-4 md:right-4 md:left-auto md:top-auto
            w-full h-full
            md:w-[500px] md:h-[700px]
            bg-white shadow-lg rounded-none md:rounded-xl
            flex flex-col border border-gray-300
          "
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/favicon.ico"
                alt="Admin avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-semibold text-sm">Nhắn tin với trợ lý AI</p>
                <p className="text-xs opacity-80">
                  Thường trả lời sau vài phút
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "Result.Display" ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {msg.data.map((product, i) => (
                      <ProductCard key={i} product={product} />
                    ))}
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[99%] text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 flex items-center border-t border-gray-300">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
