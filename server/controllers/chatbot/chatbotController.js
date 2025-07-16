const model_gemini = require("../../config/genmini");
const tools = require("./tools");
const availableFunctions = require("./availableFunctions");
const instructions_content = require("./instructions_content");
const { Type } = require("@google/genai");

exports.getResponse = async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  let contents = [];

  // Thêm lịch sử hội thoại
  if (history && Array.isArray(history)) {
    history.forEach((msg) => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    });
  }

  // Thêm message hiện tại
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  try {
    let loopCount = 0;
    const MAX_LOOP = 5; // tránh lặp vô tận

    while (loopCount < MAX_LOOP) {
      loopCount++;

      const response = await model_gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          tools: tools,
          systemInstruction: instructions_content,
        },
      });

      const toolCall = response.functionCalls?.[0];

      if (toolCall && availableFunctions[toolCall.name]) {
        const functionToCall = availableFunctions[toolCall.name];
        const result = await functionToCall(toolCall.args);

        contents.push(response.candidates[0].content); // phần model gọi function

        contents.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name: toolCall.name,
                response: { result },
              },
            },
          ],
        });

        // Lặp lại để Gemini dùng kết quả hàm -> có thể gọi tiếp hàm khác
      } else {
        // Không còn function call → trả kết quả
        return res.json({
          role: "bot",
          text: response.candidates[0].content.parts[0].text,
        });
      }
    }

    return res.status(500).json({
      error: "Quá nhiều vòng function call.",
    });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn đến Gemini:", error);
    if (error.response?.promptFeedback?.blockReasons) {
      return res.status(400).json({
        error:
          "Xin lỗi, câu hỏi của bạn có vẻ không phù hợp với chính sách của tôi.",
      });
    }
    return res.status(500).json({
      error: "Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn.",
    });
  }
};
