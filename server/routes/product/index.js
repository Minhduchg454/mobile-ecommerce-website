const brandRoutes = require('./branchRoutes')
const productCategoryRoutes = require('./productCategoryRoutes')
const productRoutes = require('./productRoutes')
const couponRoutes = require('./couponRoutes')
const couponProductVariation = require('./couponProductVariationRoutes')

const proVarianRoutes = require('./proVarianRoutes');

// Hàm khởi tạo các route liên quan đến sản phẩm
function initProductRoutes(app) {
    app.use('/api/brands', brandRoutes)
    app.use('/api/productCategories', productCategoryRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/coupons', couponRoutes)
    app.use('/api/couponProductVariations', couponProductVariation)
    app.use('/api/productVariations', proVarianRoutes)
}

module.exports = initProductRoutes