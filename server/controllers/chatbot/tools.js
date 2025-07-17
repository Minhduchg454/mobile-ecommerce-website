const { Type } = require("@google/genai");

module.exports = [
  {
    functionDeclarations: [
      {
        name: "search_product",
        description:
          "Tìm kiếm sản phẩm theo từ khóa mô tả do người dùng cung cấp.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description:
                'Từ khóa hoặc mô tả sản phẩm cần tìm, ví dụ: "Laptop mỏng nhẹ màu xám".',
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
    ],
  },
];
