const brandRoutes = require('./branchRoutes')
const productCategoryRoutes = require('./productCategoryRoutes')
const productRoutes = require('./productRoutes')
const couponRoutes = require('./couponRoutes')
const couponProductVariationRoutes = require('./couponProductVariationRoutes')
const specificProductRoutes = require('./specificProRoutes')
const proVarianRoutes = require('./proVarianRoutes')
const warrantyCardRoutes = require('./warrantyCardControllerRoutes')
const specificationRoutes = require('./specificationsRoutes')
const valueOfSpecificationsRoutes = require('./valueOfSpecificationsRoutes')

// Hàm khởi tạo các route liên quan đến sản phẩm
function initProductRoutes(app) {
    app.use('/api/brands', brandRoutes)
    app.use('/api/productCategories', productCategoryRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/coupons', couponRoutes)
    app.use('/api/couponProductVariations', couponProductVariationRoutes)
    app.use('/api/productVariations', proVarianRoutes)
    app.use('/api/specificProducts', specificProductRoutes)
    app.use('/api/warrantyCards', warrantyCardRoutes)
    app.use('/api/specifications', specificationRoutes)
    app.use('/api/valueOfSpecifications', valueOfSpecificationsRoutes)
}

module.exports = initProductRoutes


/*
    Tao thuong hieu:
    
    {
    "brandName": "Oppo"
    }
*/