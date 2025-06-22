
const brandRoutes = require('./branchRoutes')
const productCategoryRoutes = require('./productCategoryRoutes')
const productRoutes = require('./productRoutes')
const couponRoutes = require('./couponRoutes')
const couponProductVariation = require('../../models/product/couponProductVariation')

const initProductRoutes = (app) => {
    app.use('/api/brands', brandRoutes)
    app.use('/api/productCategories', productCategoryRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/coupons', couponRoutes)
    app.use('/api/coupon-product-variations', couponProductVariation)
}

module.exports = initProductRoutes