
const brandRoutes = require('./branchRoutes')


const initProductRoutes = (app) => {
    app.use('/api/brands', brandRoutes)
}

module.exports = initProductRoutes