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
    ],
  },
];
