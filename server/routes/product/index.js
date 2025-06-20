
const brandRoutes = require('./branchRoutes')
const productCategoryRoutes = require('./productCategoryRoutes')


const initProductRoutes = (app) => {
    app.use('/api/brands', brandRoutes)
    app.use('/api/productCategories', productCategoryRoutes)
}

module.exports = initProductRoutes