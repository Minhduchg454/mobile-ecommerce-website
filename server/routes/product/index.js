const brandRoutes = require('./branchRoutes')
const productCategoryRoutes = require('./productCategoryRoutes')
const productRoutes = require('./productRoutes')
const couponRoutes = require('./couponRoutes')
const couponProductVariation = require('./couponProductVariationRoutes')
//const productVariation = require('./productVariationRoutes')


// Hàm khởi tạo các route liên quan đến sản phẩm
const initProductRoutes = (app) => {
    app.use('/api/brands', brandRoutes)
    app.use('/api/productCategories', productCategoryRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/coupons', couponRoutes)
    app.use('/api/couponProductVariations', couponProductVariation)
}

module.exports = initProductRoutes