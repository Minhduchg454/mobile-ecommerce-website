const mongoose = require('mongoose');

const chatbotConfigSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    default: "Xin chào! Tôi là trợ lý tư vấn sản phẩm. Tôi có thể giúp gì cho bạn?"
  },
  theme: {
    primaryColor: {
      type: String,
      default: "#4a90e2"
    },
    secondaryColor: {
      type: String,
      default: "#357abd"
    },
    backgroundColor: {
      type: String,
      default: "#ffffff"
    },
    textColor: {
      type: String,
      default: "#2c3e50"
    }
  },
  avatar: {
    type: String,
    default: "🤖"
  },
  title: {
    type: String,
    default: "Trợ lý tư vấn sản phẩm"
  },
  position: {
    bottom: {
      type: Number,
      default: 20
    },
    right: {
      type: Number,
      default: 20
    }
  },
  size: {
    width: {
      type: Number,
      default: 380
    },
    height: {
      type: Number,
      default: 600
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatbotConfig', chatbotConfigSchema); 