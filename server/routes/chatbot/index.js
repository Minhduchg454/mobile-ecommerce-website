const chatbot = require('./chatbotRoute')
const searchProduct = require('./testRoute')

const initChatBotRoutes = (app) => {
    app.use('/api/chatbot', chatbot)
    app.use('/api/searchproduct', searchProduct)
}

module.exports = initChatBotRoutes