const model_gemini = require('../../config/genmini');
const { getCurrentWeather, searchProduct } = require('./functioncalling/utilities');

// Định nghĩa hàm mapping để gọi các hàm thực tế
const availableFunctions = {
    get_current_temperature: getCurrentWeather,
    search_product: searchProduct
};

// Định nghĩa các công cụ (tools) cho Gemini
const tools = [{
    function_declarations: [{
        name: 'get_current_temperature',
        description: 'Gets the current temperature for a given location.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city name, e.g. San Francisco',
                },
                // Nếu hàm getCurrentWeather của bạn có tham số 'unit', hãy thêm vào đây
                // unit: {
                //     type: 'string',
                //     enum: ["celsius", "fahrenheit"],
                //     description: "Đơn vị nhiệt độ (mặc định là celsius).",
                // },
            },
            required: ['location'],
        },
    },
    {
        name: 'search_product',
        description: 'Tìm kiếm sản phẩm theo từ khóa mô tả do người dùng cung cấp.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Từ khóa hoặc mô tả sản phẩm cần tìm, ví dụ: "Laptop mỏng nhẹ màu xám".'
                }
            },
            required: ['query']
        }
    }
    ],
}];

exports.getResponse = async (req, res) => {
    const { message, fullHistory } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    let conversationHistoryForGemini = [];

    // Thêm prompt ban đầu để định hướng bot
    conversationHistoryForGemini.push({
        role: "user",
        parts: [
            {
                text: `
                    Bạn là một trợ lý AI thông minh, luôn nói tiếng Việt.
                    Bạn có quyền truy cập vào các công cụ sau:
                        1. 'get_current_temperature' – dùng để lấy thông tin thời tiết hiện tại tại một vị trí cụ thể.
                        2. 'search_product' – dùng để tìm kiếm sản phẩm dựa trên mô tả hoặc từ khóa người dùng đưa ra.
                    🔹 Nếu người dùng hỏi về thời tiết ở đâu đó, bạn ** PHẢI dùng ** công cụ 'get_current_temperature'.
                    🔹 Nếu người dùng hỏi về sản phẩm, mô tả sản phẩm, hoặc muốn gợi ý sản phẩm, bạn ** PHẢI dùng ** công cụ 'search_product'.
                     💬 Ví dụ:
                     - Người dùng: Thời tiết Hà Nội hôm nay như thế nào ?
                    → Dùng: get_current_temperature(location = "Hà Nội")
                        - Người dùng: Có laptop nào mỏng nhẹ màu xám dưới 20 triệu không ?
                    → Dùng: search_product(query = "laptop mỏng nhẹ màu xám dưới 20 triệu")
                    ⚠️ Không tự đoán hay trả lời thay cho công cụ.Nếu câu hỏi thuộc phạm vi công cụ, ** phải gọi công cụ ** để lấy dữ liệu trước khi phản hồi.
                    Hãy trả lời ngắn gọn, rõ ràng, trực tiếp.
                    `,
            },
        ],
    });

    // Thêm lịch sử hội thoại từ frontend vào
    if (fullHistory && Array.isArray(fullHistory)) {
        fullHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'user' : 'model';
            conversationHistoryForGemini.push({
                role: role,
                parts: [{ text: msg.text }]
            });
        });
    }

    try {
        // Bắt đầu một phiên chat mới với lịch sử đầy đủ và các công cụ
        // RẤT QUAN TRỌNG: Truyền `tools` TRỰC TIẾP vào `startChat`
        const chat = model_gemini.startChat({
            history: conversationHistoryForGemini,
            tools: tools,
        });

        // Gửi tin nhắn mới nhất của người dùng
        const result = await chat.sendMessage(message); // Truyền message string trực tiếp
        const response = result.response;

        if (response.text()) {
            // Gemini trả lời bằng văn bản
            return res.json({ role: "bot", text: response.text() });
        } else if (response.functionCalls() && response.functionCalls().length > 0) {
            // Gemini muốn gọi một hàm
            const functionCall = response.functionCalls()[0]; // Lấy lời gọi hàm đầu tiên

            if (functionCall && availableFunctions[functionCall.name]) {
                const functionToCall = availableFunctions[functionCall.name];
                console.log(functionToCall)
                const functionArgs = functionCall.args;

                console.log(`Gemini muốn gọi hàm: ${functionCall.name} với đối số: `, functionArgs);

                // Thực thi hàm và lấy kết quả
                // Đảm bảo getCurrentWeather là async nếu nó thực hiện các hoạt động bất đồng bộ
                const callResult = await functionToCall(functionArgs.location, functionArgs.unit);

                // Gửi kết quả của hàm trở lại Gemini
                // RẤT QUAN TRỌNG: Gửi kết quả dưới dạng một Content object
                const toolResponseResult = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: functionCall.name,
                            response: callResult,
                        },
                    },
                ]);
                const finalResponseText = toolResponseResult.response.text();
                return res.json({ role: "bot", text: finalResponseText });

            } else {
                return res.status(500).json({ error: "Gemini yêu cầu một hàm không hợp lệ hoặc không được định nghĩa." });
            }
        } else {
            // Trường hợp không có text và không có functionCalls (ví dụ: blocked content)
            console.warn("Gemini did not return text or a function call.");
            return res.status(500).json({ error: "Xin lỗi, tôi không thể trả lời câu hỏi này." });
        }

    } catch (error) {
        console.error("Lỗi gửi tin nhắn đến Gemini:", error);
        // Kiểm tra xem lỗi có phải do blockReasons không để đưa ra phản hồi thân thiện hơn
        if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReasons) {
            return res.status(400).json({ error: "Xin lỗi, câu hỏi của bạn có vẻ không phù hợp với chính sách của tôi." });
        }
        res.status(500).json({ error: "Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn." });
    }
};