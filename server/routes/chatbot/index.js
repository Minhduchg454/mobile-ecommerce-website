const chatbot = require('./chatbotRoute')

const initChatBotRoutes = (app) => {
    app.use('/api/chatbot', chatbot)
}

module.exports = initChatBotRoutes