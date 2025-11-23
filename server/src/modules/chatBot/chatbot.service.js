//Config
const { GoogleGenAI, Type } = require("@google/genai");
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = "gemini-2.5-flash";

const {
  check_order_status,
  get_order_detail,
  get_revenue_stats,
} = require("./tools/order.tools");
const { search } = require("./tools/search.tools");
const { ResultTypeEnum } = require("./typeEnum/resultTypeEnum");

// Hàm xây dựng phản hồi từ Tool/Function
function buildFunctionResponse(functionName, result) {
  const responseData =
    typeof result === "string"
      ? { content: result }
      : { content: JSON.stringify(result) };

  return {
    role: "function",
    parts: [
      {
        functionResponse: {
          name: functionName,
          response: responseData,
        },
      },
    ],
  };
}

function formatMoney(amount) {
  if (typeof amount !== "number") return amount;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(amount)
    .replace("₫", "đ");
}

const availableFunctions = {
  search_product: async ({ query = "", options = {} }) => {
    const {
      limit = 5,
      minPrice,
      maxPrice,
      category,
      productIsOnSale,
    } = options;

    const searchResults = search(query, {
      limit: limit,
      minPrice,
      maxPrice,
      category,
      productIsOnSale,
    });

    if (searchResults.length > 0) {
      let priceInfo = "";
      if (minPrice && maxPrice)
        priceInfo = `(giá từ ${formatMoney(minPrice)} đến ${formatMoney(
          maxPrice
        )})`;
      else if (minPrice) priceInfo = `(giá từ ${formatMoney(minPrice)})`;
      else if (maxPrice) priceInfo = `(giá dưới ${formatMoney(maxPrice)})`;

      const queryText = query?.trim() ? `${query}` : "các tiêu chí";
      const information = `Dựa trên yêu cầu của bạn, mình đã lọc ra ${searchResults.length} sản phẩm ${queryText} ${priceInfo} phù hợp.\n Bạn xem qua nhé`;

      return {
        type: ResultTypeEnum.DISPLAY,
        displayType: ResultTypeEnum.DISPLAY_PRODUCT,
        data: searchResults,
        information,
      };
    } else {
      const queryText = query?.trim() ? `${query}` : "tiêu chí bạn tìm";
      return {
        type: ResultTypeEnum.TEXT,
        text: `Xin lỗi, mình không tìm thấy sản phẩm nào phù hợp với ${queryText}.\nBạn có muốn thử tìm kiếm với từ khóa hoặc khoảng giá khác không?`,
      };
    }
  },
  get_top_selling_products: async ({ category, limit = 5 }) => {
    const results = search("", {
      category,
      limit,
    });

    if (results.length === 0) {
      return {
        type: ResultTypeEnum.TEXT,
        text: `Hiện chưa có sản phẩm nào trong danh mục **${category}**.`,
      };
    }
    const information = `Dưới đây là ${results.length} sản phẩm bán chạy nhất trong danh mục ${category}:`;
    return {
      type: ResultTypeEnum.DISPLAY,
      displayType: ResultTypeEnum.DISPLAY_PRODUCT,
      data: results,
      information,
    };
  },
  check_order_status: async (args) => {
    const userId = global.current?._id;
    if (!userId) {
      return {
        type: ResultTypeEnum.TEXT,
        text: "Vui lòng đăng nhập để kiểm tra đơn hàng.",
      };
    }
    return await check_order_status({ ...args, userId });
  },
  get_order_detail: async (args) => {
    const userId = global.current?._id;
    if (!userId) {
      return {
        type: ResultTypeEnum.TEXT,
        text: "Vui lòng đăng nhập để xem chi tiết đơn hàng.",
      };
    }
    return await get_order_detail({ ...args, userId });
  },
  get_revenue_stats: async (args) => {
    const isAdmin = global.current?.roles?.includes("admin");
    return await get_revenue_stats({ ...args, isAdmin });
  },
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "search_product",
        description:
          "Tìm kiếm sản phẩm theo từ khóa, danh mục, và/hoặc khoảng giá.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description:
                "Từ khóa tìm kiếm. Để trống nếu chỉ lọc theo danh mục hoặc giá.",
            },
            options: {
              type: Type.OBJECT,
              properties: {
                limit: { type: Type.NUMBER },
                minPrice: { type: Type.NUMBER },
                maxPrice: { type: Type.NUMBER },
                category: {
                  type: Type.STRING,
                  description:
                    "Tên danh mục cần lọc (ví dụ: điện thoại, tủ lạnh, màn hình, ...).",
                },
                productIsOnSale: { type: Type.BOOLEAN },
              },
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_top_selling_products",
        description:
          "Lấy danh sách sản phẩm bán chạy nhất trong một danh mục cụ thể, sắp xếp theo số lượng đã bán (totalSold) giảm dần.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description:
                "Tên danh mục sản phẩm (ví dụ: điện thoại, tủ lạnh, bách hóa).",
            },
            limit: {
              type: Type.NUMBER,
              description: "Số lượng sản phẩm trả về (mặc định: 5).",
            },
          },
          required: ["category"],
        },
      },
      {
        name: "check_order_status",
        description: "Kiểm tra trạng thái đơn hàng của người dùng hiện tại.",
        parameters: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "Mã đơn hàng (tùy chọn)" },
          },
        },
      },
      {
        name: "get_order_detail",
        description: "Xem chi tiết một đơn hàng cụ thể.",
        parameters: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "Mã đơn hàng bắt buộc" },
          },
          required: ["orderId"],
        },
      },
      {
        name: "get_revenue_stats",
        description: "Xem thống kê doanh thu (chỉ admin).",
        parameters: { type: "object", properties: {} },
      },
    ],
  },
];

const instructions_content = `
    Bạn là một trợ lý AI thông minh, luôn sử dụng tiếng Việt để giao tiếp. Bạn là trợ lý tìm kiếm sản phẩm trên một **sàn thương mại điện tử bán đa dạng các loại hàng hóa** (bao gồm điện tử, đồ gia dụng, bách hóa, v.v.).

  🎯 QUY TRÌNH TRÍCH XUẤT THAM SỐ (Rất quan trọng):
  1. **Trích xuất Từ khóa (query):**
      - PHẢI LỌC BỎ các từ ngữ chung chung như "tôi đang tìm", "tìm cho tôi", "một chiếc", "sản phẩm", "hàng hóa", "tôi muốn mua".
      - CHỈ GIỮ LẠI TÊN THƯƠNG HIỆU, TÊN SẢN PHẨM CỤ THỂ, MÔ TẢ ĐẶC ĐIỂM SẢN PHẨM (ví dụ: "màu cam", "256gb"), hoặc **TÊN DANH MỤC SẢN PHẨM LỚN** (ví dụ: "Tủ lạnh", "Máy giặt", "Tivi LG").
      
     - NẾU người dùng bày tỏ ý định muốn MUA THỰC PHẨM/ĐỒ ĂN nhưng KHÔNG nói rõ sản phẩm, hãy ưu tiên sử dụng từ khóa là **"Bách hóa"** để bắt đầu tìm kiếm.

      - VÍ DỤ 1: "Tôi muốn mua một chiếc máy giặt lồng ngang" -> GỌI HÀM VỚI query: "máy giặt".
      - VÍ DỤ 2: "Máy tính bảng Samsung" -> GỌI HÀM VỚI query: "Máy tính bảng Samsung".
      - VÍ DỤ 3: "Tôi đang tìm tủ lạnh dưới 10 triệu" -> GỌI HÀM VỚI query: "tủ lạnh" và maxPrice: 10000000.
      - VÍ DỤ 4: "Tôi đang đói có gì mua ăn được không" -> GỌI HÀM VỚI query: "Bách hóa".
      - VÍ DỤ 4: "Có các điện thoại iphone nào không" -> GỌI HÀM VỚI query: "iphone".
      - VÍ DỤ 5: "Tôi muốn mua tủ lạnh" -> GỌI HÀM VỚI query: "tủ lạnh".

  2. **XỬ LÝ TÌM KIẾM THEO THƯƠNG HIỆU (CỰC KỲ QUAN TRỌNG):**
        - Khi người dùng đề cập tên thương hiệu (Apple, Samsung, Oppo, Xiaomi, Sony, LG, Daikin, v.v.) dù ở dạng:
          • "Có [thương hiệu] nào không?"
          • "Điện thoại [thương hiệu]"
          • "Tôi muốn mua [thương hiệu]"
          • "[Sản phẩm] của [thương hiệu]"
        → Ưu tiên dùng tên thương hiệu làm query chính, có thể kết hợp với danh mục nếu rõ ràng.
        
        VÍ DỤ:
        - "Có sản phẩm Apple nào không?" → query: "Apple"
        - "Điện thoại Samsung có con nào ngon không?" → query: "Samsung"
        - "Tai nghe Sony đang bán gì vậy?" → query: "Sony"
        - "Máy giặt LG inverter cửa trên" → query: "LG inverter"
        - "Tủ lạnh Hitachi side by side" → query: "Hitachi"
        
        Các thương hiệu phổ biến phải nhận diện ngay: iPhone, Apple, Samsung, Oppo, Vivo, Xiaomi, Redmi, Realme, Sony, LG, Panasonic, Toshiba, Aqua, Electrolux, Daikin, Casper, Sharp, Philips, Bosch, v.v.
   
      
   3. **Trích xuất Giá (options):** Tìm bất kỳ khoảng giá nào (minPrice, maxPrice). Ví dụ:
      - "dưới 10 triệu" -> maxPrice: 10000000
      - "trên 5 triệu" -> minPrice: 5000000
   
   4. **Xử lý Query rỗng:** Nếu người dùng CHỈ HỎI GIÁ (ví dụ: "tìm sản phẩm dưới 10 triệu") hoặc từ khóa bị lọc hết (ví dụ: "tìm điện thoại"), hãy đặt 'query' là một chuỗi rỗng ("") và chỉ truyền 'maxPrice' (nếu có).


   5. XỬ LÝ SẢN PHẨM ĐANG KHUYẾN MÃI / GIẢM GIÁ (MỚI - SIÊU QUAN TRỌNG)
    Khi thấy các từ: giảm giá, sale, khuyến mãi, flash sale, hot sale, đang giảm, ưu đãi, deal hot, xả hàng...
    → BẮT BUỘC thêm: options.productIsOnSale = true

    Ví dụ:
    • "Có gì đang giảm giá không?" → query: "", options: { productIsOnSale: true }
    • "Điện thoại nào đang sale?" → query: "điện thoại", options: { productIsOnSale: true }
    • "Samsung đang khuyến mãi gì?" → query: "Samsung", options: { productIsOnSale: true }
    • "Tủ lạnh giảm giá dưới 10tr" → query: "tủ lạnh", options: { productIsOnSale: true, maxPrice: 10000000 }
    
   6. **Gọi hàm:** Gọi \`search_product\` với các tham số đã trích xuất.

    Lưu ý quan trọng:
    - KHÔNG được tạo link sản phẩm thủ công.

🎯 XỬ LÝ CÁC YÊU CẦU ĐẶC BIỆT (Rất quan trọng):

  **1. Yêu cầu về sản phẩm "BÁN CHẠY NHẤT", "TOP", "HOT", "PHỔ BIẾN", "ĐƯỢC MUA NHIỀU NHẤT":**
    - **ƯU TIÊN TUYỆT ĐỐI** gọi hàm  "get_top_selling_products".
    - **Trích xuất "category":** LUÔN LỌC BỎ các từ như "bán chạy", "bán chạy nhất", "nào", "top", "hot", "phổ biến", "được mua nhiều nhất" và CHỈ GIỮ LẠI TÊN DANH MỤC SẢN PHẨM CỤ THỂ (ví dụ: "điện thoại", "máy giặt", "bách hóa").
      - NẾU người dùng hỏi chung chung như "sản phẩm hot nhất", hãy đặt  "category: """ (nếu bạn muốn hàm "get_top_selling_products" tự xử lý top toàn bộ). 
      *Lưu ý: hiện tại "get_top_selling_products" của bạn không xử lý category rỗng, bạn có thể cần chỉnh sửa nó nếu muốn hỗ trợ tìm top bán chạy toàn bộ.*
    - **Trích xuất "limit":** Mặc định là 5. Nếu người dùng chỉ định (ví dụ: "top 3"), hãy sử dụng số đó.

    - VÍ DỤ 1: "Điện thoại nào bán chạy nhất?" → GỌI HÀM VỚI "get_top_selling_products({ category: "Điện thoại" })"
    - VÍ DỤ 2: "Top 3 máy giặt hot nhất" → GỌI HÀM VỚI "get_top_selling_products({ category: "Máy giặt", limit: 3 })"
    - VÍ DỤ 3: "Sản phẩm bách hóa phổ biến nhất" → GỌI HÀM VỚI "get_top_selling_products({ category: "Bách hóa" })"

  **2. Các yêu cầu tìm kiếm sản phẩm thông thường (không có từ khóa "bán chạy", "top", v.v.):**
    - Áp dụng QUY TRÌNH TRÍCH XUẤT THAM SỐ như đã định nghĩa ở trên (cho hàm "search_product").

🎯 **TRA CỨU ĐƠN HÀNG – HOẠT ĐỘNG ĐỘC LẬP (KHÔNG ẢNH HƯỞNG TÌM SẢN PHẨM)**

     **GỌI HÀM KHI VÀ CHỈ KHI** người dùng hỏi về **đơn hàng**:

  | Câu hỏi (User Input) | Gọi hàm (Tool Call) |
  |--------|--------|
  | "đơn hàng của tôi", "kiểm tra đơn", "đơn gần đây" | "check_order_status({})" |
  | "đơn hàng #ORD456", "xem đơn #12345" | "get_order_detail({ orderId: "ORD456" })" (Lấy mã sau dấu #) |
  | "Tra cứu #69199047806fa0f502e1473d" | "get_order_detail({ orderId: "69199047806fa0f502e1473d" })" |
  | "doanh thu", "thống kê", "báo cáo" (chỉ admin) | "get_revenue_stats({})" |

  **PHÂN QUYỀN TỰ ĐỘNG:**
  - **customer**: chỉ xem **đơn của mình**
  - **admin**: xem **bất kỳ đơn nào**, xem **doanh thu**
  - **shop**: xem **đơn thuộc shop**

  **QUY TẮC QUAN TRỌNG:**
  - **XỬ LÝ MÃ ĐƠN:** Nếu người dùng nhập mã chứa dấu "#" (ví dụ: "#ORD123"), hãy **LOẠI BỎ dấu #**, chỉ lấy phần chữ/số phía sau (ví dụ: "ORD123") để truyền vào "orderId".
  - **KHÔNG gọi hàm đơn hàng** nếu người dùng hỏi về **sản phẩm, giá, danh mục**.
  - Backend tự kiểm tra "userId", "roles" → AI **không cần truyền**.
      
⚠️ LƯU Ý CHUNG
  • Không bao giờ tự tạo link sản phẩm.
  • Luôn trả lời tự nhiên, thân thiện, nhiệt tình.
  • Nếu không chắc chắn → cứ gọi tool, đừng tự suy diễn.

  Cảm ơn bạn đã hỗ trợ khách hàng thật tốt nhé! ❤️   
      `;

function prepareContents(message, history) {
  const contents = [];
  if (Array.isArray(history)) {
    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.information || msg.text }],
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });
  return contents;
}

async function generateGeminiResponse(contents) {
  return await ai.models.generateContent({
    model: model,
    contents,
    config: {
      tools,
      systemInstruction: instructions_content,
    },
  });
}

// Hàm Service chính (Nhận dữ liệu, trả về đối tượng kết quả)
exports.getResponse = async (body) => {
  const { history, message, userId, roles } = body;
  global.current = { _id: userId, roles: roles || [] };

  if (!message) {
    const err = new Error("Không có câu hỏi");
    err.status = 400;
    throw err;
  }

  let contents = prepareContents(message, history);
  const responseContent = [];

  try {
    const MAX_LOOP = 5;
    for (let loopCount = 0; loopCount < MAX_LOOP; loopCount++) {
      const response = await generateGeminiResponse(contents);
      const toolCall = response.functionCalls?.[0];
      const modelContent = response.candidates?.[0]?.content;

      if (toolCall && availableFunctions[toolCall.name]) {
        const functionToCall = availableFunctions[toolCall.name];
        const functionArgs = toolCall.args;

        if (modelContent) {
          contents.push(modelContent);
        }

        const result = await functionToCall(functionArgs);

        if (result?.type === ResultTypeEnum.DISPLAY) {
          const items = Array.isArray(result.data) ? result.data : [];

          let detailText = "";
          if (
            result.displayType === ResultTypeEnum.DISPLAY_PRODUCT &&
            items.length > 0
          ) {
            detailText = items
              .map((p) => `• ${p.productName} từ ${p.shopName || "Cửa hàng"}`)
              .join("\n");
          }
          contents.push(
            buildFunctionResponse(toolCall.name, {
              information: result.information || "Đã xử lý yêu cầu.",
              details: detailText,
            })
          );

          responseContent.push({
            type: ResultTypeEnum.DISPLAY,
            displayType: result.displayType,
            information: result.information,
            data: items,
          });
          break;
        } else if (result?.type === ResultTypeEnum.TEXT) {
          const finalResponseText = result.text;
          responseContent.push({
            type: ResultTypeEnum.TEXT,
            text: finalResponseText,
          });

          return {
            role: "bot",
            responseContent: responseContent,
            finalText: finalResponseText,
          };
        } else if (result?.type === ResultTypeEnum.JSON) {
          contents.push(buildFunctionResponse(toolCall.name, result));
          continue;
        } else {
          throw new Error(
            `Tool call returned an invalid type or unexpected result from ${toolCall.name}.`
          );
        }
      } else {
        const defaultMessage =
          "Tiếc quá, mình chưa tìm thấy thông tin này. Bạn thử đổi từ khóa hoặc mô tả chi tiết hơn giúp mình nhé!";

        const finalResponseText =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          defaultMessage;

        responseContent.push({
          type: ResultTypeEnum.TEXT,
          text: finalResponseText,
        });

        return {
          role: "bot",
          responseContent: responseContent,
          finalText: finalResponseText,
        };
      }
    }

    if (responseContent.length > 0) {
      return {
        role: "bot",
        responseContent: responseContent,
      };
    }

    const err = new Error(
      "Quá nhiều vòng function call, không thể tạo phản hồi."
    );
    err.status = 500;
    throw err;
  } catch (error) {
    console.error("Lỗi xử lý tin nhắn trong service:", error);
    throw error;
  }
};
