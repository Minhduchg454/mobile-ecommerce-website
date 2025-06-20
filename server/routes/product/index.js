
const brandRoutes = require('./branchRoutes')


const initRoutesProduct = (app) => {
    app.use('/api/brand', brandRoutes)
}

module.exports = initRoutesProduct