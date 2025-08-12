import { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import ProductCard from "./component/ProductCard";

import { ResultTypeEnum } from "./ResultTypeEnum";
import { apiSendMessageToChatbot } from "apis/chatbot";
import { marked } from "marked";
import useRole from "hooks/useRole";

const markdown = "**Xin chào** bạn!";
const html = marked(markdown);
console.log("html", html);
const BASE_URL = "http://localhost:3000/";

function parseMarkdownStructuredHtml(text) {
  // 1. Xử lý khoảng trắng * khoảng trắng → xuống dòng dạng danh sách
  text = text.replace(/\s\*\s/g, "\n- ");

  // 2. Xử lý **key:** value → in đậm `key`
  text = text.replace(/\*\*(.+?)\*\*:/g, "<strong>$1:</strong>");

  // 3. Xử lý các **tiêu đề** đơn thuần (chỉ có **...** không có dấu :) => h4
  text = text.replace(/(?:^|\n)\*\*(.+?)\*\*(?:\n|$)/g, "\n<h4>$1</h4>");

  // 4. Tách thành dòng để phân biệt gạch đầu dòng vs. đoạn thường
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let html = "";
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      html += `<ul style="margin-top: 0.5rem; padding-left: 1.2rem;">${listItems
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul>`;
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else if (line.startsWith("<h4>")) {
      flushList();
      html += line;
    } else {
      flushList();
      html += `<p>${line}</p>`;
    }
  }

  flushList();
  return html;
}

function convertMarkdownToHTML(markdown) {
  const lines = markdown.split("\n");

  let html = "";
  let insideList = false;

  for (let line of lines) {
    line = line.trim();

    // Tiêu đề sản phẩm (định dạng **1. Tên sản phẩm**)
    if (/^\*\*\d+\..+\*\*$/.test(line)) {
      const title = line.replace(/\*\*/g, "");
      if (insideList) {
        html += "</ul>";
        insideList = false;
      }
      html += `<h4 style="margin-top: 1rem;">${title}</h4>`;
    }

    // Gạch đầu dòng dạng thông tin: * **key:** value
    else if (/^\*\s+\*\*.+?:\*\*/.test(line)) {
      const cleaned = line
        .replace(/^\*\s+/, "") // bỏ dấu *
        .replace(/\*\*(.+?):\*\*/g, "<strong>$1:</strong>"); // in đậm key
      if (!insideList) {
        html += '<ul style="padding-left:1.2rem;">';
        insideList = true;
      }
      html += `<li>${cleaned}</li>`;
    }

    // Link markdown: [text](url)
    else if (/\[.+?\]\(.+?\)/.test(line)) {
      const converted = line.replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank">$1</a>'
      );
      html += `<p>${converted}</p>`;
    }

    // Các dòng khác
    else if (line) {
      if (insideList) {
        html += "</ul>";
        insideList = false;
      }
      html += `<p>${line}</p>`;
    }
  }

  if (insideList) html += "</ul>";

  return html;
}

// 🧪 Dữ liệu test:
const sampleText = `
Điện thoại Samsung Galaxy A55 - Black 8GB/256GB có các thông số chi tiết như sau: * **Tên sản phẩm:** Samsung Galaxy A55 - Black 8GB/256GB * **Mô tả:** Phân khúc tầm trung, pin khỏe, màn hình AMOLED sắc nét. * **Giá:** 9.900.000₫ * **Thông số kỹ thuật:** * RAM: 8GB * Bộ nhớ trong: 256GB * Màu sắc: Đen * **Link sản phẩm:** Xem chi tiết Bạn có muốn tìm hiểu thêm về sản phẩm nào khác không?
`;

const sampleText2 = `
Dưới đây là một số sản phẩm Samsung màu xanh mà bạn có thể quan tâm:

**1. Samsung galaxy a55 - Xanh 12/128**
*   **Giá:** 8.300.000₫
*   **Mô tả:** Nhỏ gọn, trẻ trung, năng động
*   **RAM:** 12GB
*   **Bộ nhớ trong:** 128GB
*   **Màu sắc:** Xanh
*   **Hệ điều hành:** Android 14
*   **Link sản phẩm:** [https://cuahangdientu.com/dien-thoai/samsung-galaxy-a55/?code=68714619d39eff05f032c6ee](https://cuahangdientu.com/dien-thoai/samsung-galaxy-a55/?code=68714619d39eff05f032c6ee)
*   *Sản phẩm này hiện đang hết hàng.*

**2. Ốp lưng dẻo cao cấp samsung s25 - Dẻo**
*   **Giá:** 456.000₫
*   **Mô tả:** Bảo vệ vượt trội
*   **Màu sắc:** Xanh
*   **Link sản phẩm:** [https://cuahangdientu.com/phu-kien-dien-thoai/op-lung-deo-cao-cap-samsung-s25/?code=687f5d85703ad62c06905c15](https://cuahangdientu.com/phu-kien-dien-thoai/op-lung-deo-cao-cap-samsung-s25/?code=687f5d85703ad62c06905c15)

Bạn có muốn xem chi tiết sản phẩm nào không? Hoặc bạn có muốn tìm kiếm sản phẩm Samsung màu xanh khác không?
`;

const sampleText3 = `
"Đã tìm thấy 3 sản phẩm Samsung cho bạn:

**1. Samsung galaxy a55 - Black 8/256**
* Giá: 8.500.000₫
* Mô tả: Nhỏ gọn, trẻ trung, năng động
* Đánh giá: 5/5
* Số lượng còn lại: 2
* Link sản phẩm: https://res.cloudinary.com/dedyoxsln/image/upload/v1752254826/cuahangdientu/gxmr0narqp6yoccxhasr.jpg
* Thông số kỹ thuật:
    * RAM: 8GB
    * Color: Black
    * Internal Storage: 256GB
    * Operating System: Android 14
    * Processor: Exynos 1480 8 nhân
    * Screen Size: 6.6"
    * Camera (Front): 32 MP
    * Screen Resolution: Full HD+
    * Camera (Rear): Chính 50 MP & Phụ 12 MP, 5 MP
    * Graphics Card: MD Titan 1WGP
    * Material: Khung kim loại & Mặt lưng kính
    * Weight: 0,216kg
    * Battery Capacity: 5000 mAh
    * Dimensions: Dài 161.1 mm - Ngang 77.4 mm - Dày 8.2 mm

**2. Samsung galaxy a55 - Xanh 12/128**
* Giá: 8.300.000₫
* Mô tả: Nhỏ gọn, trẻ trung, năng động
* Đánh giá: 4/5
* Số lượng còn lại: 0
* Link sản phẩm: https://res.cloudinary.com/dedyoxsln/image/upload/v1752253976/cuahangdientu/bsbkks4tjbmxg9b5fslj.jpg
* Thông số kỹ thuật:
    * RAM: 12GB
    * Internal Storage: 128GB
    * Color: Xanh
    * Operating System: Android 14
    * Processor: Exynos 1480 8 nhân
    * Screen Size: 6.6"
    * Camera (Front): 32 MP
    * Screen Resolution: Full HD+
    * Camera (Rear): Chính 50 MP & Phụ 12 MP, 5 MP
    * Graphics Card: MD Titan 1WGP
    * Material: Khung kim loại & Mặt lưng kính
    * Weight: 0,216kg
    * Battery Capacity: 5000 mAh
    * Dimensions: Dài 161.1 mm - Ngang 77.4 mm - Dày 8.2 mm

**3. Ốp lưng dẻo cao cấp samsung s25 - Dẻo**
* Giá: 456.000₫
* Mô tả: Bảo vệ vượt trội
* Đánh giá: 0/5
* Số lượng còn lại: 9
* Link sản phẩm: https://res.cloudinary.com/dedyoxsln/image/upload/v1753177477/cuahangdientu/dtc4jvi2wvzw73fstjn5.webp
* Thông số kỹ thuật:
    * Color: Xanh

Bạn có muốn xem chi tiết sản phẩm nào không?"
`;

const parsedHTML = convertMarkdownToHTML(sampleText2);

function formatProductSpecs(text) {
  const lines = text
    .split(/\r?\n|(?=\*\*)/g)
    .map((line) => line.trim())
    .filter(Boolean);

  let result = "";
  let currentProduct = "";
  let details = [];

  const flushProduct = () => {
    if (currentProduct) {
      result += `<div style="margin-bottom: 1rem;">
        <h4 style="margin: 0; font-weight: bold;">${currentProduct}</h4>
        <ul style="margin-top: 0.5rem;">${details
          .map((d) => `<li>${d}</li>`)
          .join("")}</ul>
      </div>`;
      currentProduct = "";
      details = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("**") && line.endsWith(":**")) {
      flushProduct();
      currentProduct = line.replace(/\*\*/g, "").replace(/:$/, "");
    } else if (line.startsWith("* **")) {
      const cleaned = line.replace(/^\* \*\*/, "").replace(/\*\*:/, ":");
      details.push(cleaned);
    } else {
      flushProduct();
      result += `<p>${line}</p>`;
    }
  }

  flushProduct();

  return result;
}

function addDomainToRelativeLinks(text) {
  return text.replace(
    /\b(?:dien-thoai|phu-kien-dien-thoai)[^\s)"]+/g,
    (match) => {
      // Nếu đã là URL đầy đủ thì không thêm BASE_URL nữa
      if (match.startsWith("http://") || match.startsWith("https://"))
        return match;
      return `${BASE_URL}${match}`;
    }
  );
}

function removeDuplicateBaseUrl(text) {
  const doubleBase = BASE_URL + BASE_URL;
  return text.replaceAll(doubleBase, BASE_URL);
}

function formatTextWithLinks(text) {
  const withFullLinks = addDomainToRelativeLinks(text);

  // Không thay link đã nằm trong <a href="...">
  return withFullLinks.replace(/(?<!href=")(https?:\/\/[^\s"<]+)/g, (url) => {
    // Nếu đã bọc trong thẻ <a> rồi thì giữ nguyên
    if (text.includes(`href="${url}`)) return url;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">Xem chi tiết</a>`;
  });
}

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useRole();

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

    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true); // ⏳ Bắt đầu loading

    try {
      const res = await apiSendMessageToChatbot({
        message: userMessage.text,
        history: messages,
      });
      //console.log("res.responseContent", res.responseContent);
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
            // text: formatProductSpecs(
            //   removeDuplicateBaseUrl(formatTextWithLinks(item.text))
            // ),
            text: marked(
              removeDuplicateBaseUrl(formatTextWithLinks(item.text))
            ),
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
    } finally {
      setIsLoading(false); // ✅ Kết thúc loading
    }
  };
  if (isAdmin) return null;

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
            xl:w-[800px] xl:h-[800px]
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
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
