const payment = require('./paymentRoutes')

const initOrderRoutes = (app) => {
    app.use('/api/payments', payment)
}

module.exports = initOrderRoutes