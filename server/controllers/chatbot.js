const ChatbotConfig = require('../models/ChatbotConfig');
const { model, createProductPrompt } = require('../config/gemini');
const Product = require('../models/Product');

const chatbotController = {
  // Lấy cấu hình chatbot
  getConfig: async (req, res) => {
    try {
      const config = await ChatbotConfig.findOne();
      if (!config) {
        // Nếu chưa có cấu hình, tạo mới với giá trị mặc định
        const newConfig = await ChatbotConfig.create({});
        return res.json(newConfig);
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật cấu hình chatbot
  updateConfig: async (req, res) => {
    try {
      const config = await ChatbotConfig.findOne();
      if (!config) {
        const newConfig = await ChatbotConfig.create(req.body);
        return res.json(newConfig);
      }

      const updatedConfig = await ChatbotConfig.findOneAndUpdate(
        {},
        req.body,
        { new: true }
      );
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Bật/tắt chatbot
  toggleActive: async (req, res) => {
    try {
      const config = await ChatbotConfig.findOne();
      if (!config) {
        return res.status(404).json({ message: 'Không tìm thấy cấu hình chatbot' });
      }

      config.isActive = !config.isActive;
      await config.save();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Xử lý tin nhắn từ người dùng
  handleMessage: async (req, res) => {
    try {
      const { message } = req.body;
      
      // Tìm sản phẩm phù hợp với tin nhắn
      const products = await Product.find({
        $or: [
          { title: { $regex: message, $options: 'i' } },
          { description: { $regex: message, $options: 'i' } }
        ]
      }).limit(1);

      if (products.length > 0) {
        // Tạo prompt với thông tin sản phẩm
        const prompt = createProductPrompt(products[0]);
        
        // Gọi Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiMessage = response.text();
        
        res.json({ message: aiMessage });
      } else {
        res.json({ 
          message: "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp. Bạn có thể mô tả chi tiết hơn không?"
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      res.status(500).json({ 
        message: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau."
      });
    }
  }
};

module.exports = chatbotController; 