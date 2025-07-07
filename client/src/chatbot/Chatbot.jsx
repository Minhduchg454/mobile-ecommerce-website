import { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { data_chatbot } from "./data_chatbot";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyDwdcPo0iYZNvGYZ5uhGnHrsIWCio_T_kQ"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `
              You are a helpful assistant. Here is some background information:
              1. Aways speak VietNamese
              2. Đường link của điện thoại của trang web: "http://localhost:3000/dtdd/6857ddf00ecc9145773c437a/samsung-galaxy-a55"
              ${data_chatbot}
            `,
          },
        ],
      },
    ],
  });

  useEffect(() => {
    setMessages([{ role: "bot", text: "Chào mừng bạn đến với Citaa!" }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await chat.sendMessage(userMessage.text);
      const botMessage = { role: "bot", text: response.response.text() };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi gửi:", error);
      const errorMessage = { role: "bot", text: "Xin lỗi, đã có lỗi xảy ra." };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg focus:outline-none"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 w-96 h-[600px] bg-white shadow-lg rounded-xl flex flex-col border border-gray-300">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="%PUBLIC_URL%/favicon.ico"
                alt="Admin avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-semibold text-sm">Nhắn tin với admin</p>
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
                <div
                  className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
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
