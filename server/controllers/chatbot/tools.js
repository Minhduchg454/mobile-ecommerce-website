const { Type } = require("@google/genai");

module.exports = [
  {
    functionDeclarations: [
      {
        name: "search_product",
        description:
          "Tìm kiếm sản phẩm theo từ khóa mô tả do người dùng cung cấp. Có thể tùy chỉnh giới hạn số lượng kết quả trả về và độ chính xác khi tìm kiếm.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description:
                'Từ khóa hoặc mô tả sản phẩm cần tìm, ví dụ: "Laptop mỏng nhẹ màu xám".',
            },
            options: {
              type: Type.OBJECT,
              description: "Tùy chọn nâng cao cho tìm kiếm.",
              properties: {
                limit: {
                  type: Type.NUMBER,
                  description:
                    "Số lượng kết quả sản phẩm tối đa trả về. Mặc định là 10. Tăng lên để nhận nhiều kết quả hơn.",
                },
                threshold: {
                  type: Type.NUMBER,
                  description:
                    "Độ chính xác khi tìm kiếm (0.0 đến 1.0). Giá trị càng thấp thì kết quả càng khớp chính xác. Mặc định là 0.5. Tăng lên để nhận nhiều kết quả hơn",
                },
              },
            },
          },
          required: ["query"],
        },
      },

      {
        name: "display_all_product_with_key_word",
        description: "Hiển thị tất cả sản phẩm liên quan đến từ khóa tìm kiếm",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description:
                'Từ khóa hoặc mô tả sản phẩm cần hiển thị, ví dụ: "Laptop mỏng nhẹ màu xám".',
            },
          },
          required: ["query"],
        },
      },
      {
        name: "search_product_by_ids",
        description:
          "Trả về chính xác thông tin về các sản phẩm theo một danh sách id",
        parameters: {
          type: Type.OBJECT,
          properties: {
            variationIds: {
              type: Type.ARRAY,
              description:
                "Danh sách các ID của biến thể sản phẩm (product variation).",
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["variationIds"],
        },
      },
      {
        name: "display_product_with_ids",
        description:
          "Trả về chính xác thông tin của các sản phẩm dựa trên danh sách ID biến thể (product variation).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            variationIds: {
              type: Type.ARRAY,
              description:
                "Danh sách ID của các biến thể sản phẩm (ví dụ: ['687145d2...', '686207de...']).",
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["variationIds"],
        },
      },
    ],
  },
];
