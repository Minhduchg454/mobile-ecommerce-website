const payment = require('./paymentRoutes')
const shippingProvider = require('./shippingProviderRoutes')
const order = require('./orderRoutes')

const initChatBotRoutes = (app) => {
    app.use('/api/payments', payment)
    app.use('/api/shippingproviders', shippingProvider)
    app.use('/api/orders', order)
}

module.exports = initChatBotRoutes