import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini AI với API key
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Cấu hình model
export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Hàm tạo prompt cho chatbot
export const createProductPrompt = (productInfo) => {
  return `Bạn là một trợ lý tư vấn sản phẩm thông minh. Dưới đây là thông tin sản phẩm:
  ${JSON.stringify(productInfo, null, 2)}
  
  Hãy tư vấn cho khách hàng về sản phẩm này một cách thân thiện và chuyên nghiệp.`;
}; 