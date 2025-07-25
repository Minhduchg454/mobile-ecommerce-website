const model_gemini = require("../../config/genmini");
const tools = require("./tools");
const availableFunctions = require("./availableFunctions");
const instructions_content = require("./instructions_content");
const ResultTypeEnum = require("./ResultTypeEnum");

exports.getResponse = async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }
  // console.log(req.body);
  let contents = prepareContents(message, history);
  const responseContent = [];

  try {
    const MAX_LOOP = 5;
    for (let loopCount = 0; loopCount < MAX_LOOP; loopCount++) {
      const response = await generateGeminiResponse(contents);

      const toolCall = response.functionCalls?.[0];

      if (toolCall && availableFunctions[toolCall.name]) {
        const functionToCall = availableFunctions[toolCall.name];
        const result = await functionToCall(toolCall.args);

        if (result?.type === ResultTypeEnum.DISPLAY) {
          const displayedProductsSummary = result.suggestions
            .map((p) => `• ${p.name} (ID: ${p.id})`)
            .join("\n");

          const information = `Đã hiển thị các sản phẩm sau:\n${displayedProductsSummary}`;

          responseContent.push({
            type: ResultTypeEnum.DISPLAY,
            data: result.suggestions,
            information: information,
          });
          contents.push(response.candidates[0].content); // ghi nhận model gọi hàm
          contents.push(
            buildFunctionResponse(
              toolCall.name,
              "Đã hiển thị sản phâm liên quan"
            )
          );
          continue; // QUAN TRỌNG
        } else {
          contents.push(response.candidates[0].content); // ghi nhận model gọi hàm
          // console.log(
          //   "response.candidates[0].content",
          //   response.candidates[0].content
          // );
          contents.push(buildFunctionResponse(toolCall.name, result)); // trả kết quả
          continue; // QUAN TRỌNG
        }
      } else {
        responseContent.push({
          type: ResultTypeEnum.TEXT,
          text:
            response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Không có phản hồi phù hợp.",
        });
        return res.json({
          role: "bot",
          responseContent: responseContent,
        });
      }
    }

    return res.status(500).json({ error: "Quá nhiều vòng function call." });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn đến Gemini:", error);
    return res.status(500).json({
      error: error.response?.promptFeedback?.blockReasons
        ? "Xin lỗi, câu hỏi của bạn có vẻ không phù hợp với chính sách của tôi."
        : "Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn.",
    });
  }
};

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
  return await model_gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      tools,
      systemInstruction: instructions_content,
    },
  });
}

function buildFunctionResponse(functionName, result) {
  return {
    role: "function",
    parts: [
      {
        functionResponse: {
          name: functionName,
          response: { result },
        },
      },
    ],
  };
}
