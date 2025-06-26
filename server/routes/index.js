const userRouter = require('./user/__user')
// const productRouter = require('./product')
// const productCategoryRouter = require('./productCategory')
// const blogCategoryRouter = require('./blogCategory')
// const blog = require('./blog')
// const brand = require('./brand')
// const coupon = require('./coupon')
// const insert = require('./insert')
const { notFound, errHandler } = require('../middlewares/errHandler')
// const accountRouter = require('./user/account')
const roleRouter = require('./user/role')
const adminRouter = require('./user/admin')
const addressRouter = require('./user/address')
const shoppingCartRouter = require('./user/shoppingCart')
const cartItemRouter = require('./user/cartItem')
const previewRouter = require('./user/preview')

const initRoutes = (app) => {
    // Mount router user để các route /api/user/... hoạt động
    app.use('/api/user', userRouter)
    // app.use('/api/account', accountRouter)
    app.use('/api/role', roleRouter)
    app.use('/api/admin', adminRouter)
    app.use('/api/address', addressRouter)
    app.use('/api/shoppingcart', shoppingCartRouter)
    app.use('/api/cartitem', cartItemRouter)
    app.use('/api/preview', previewRouter)
    // app.use('/api/blogcategory', blogCategoryRouter)
    // app.use('/api/prodcategory', productCategoryRouter)
    // app.use('/api/blog', blog)
    // app.use('/api/brand', brand)
    // app.use('/api/coupon', coupon)
    // app.use('/api/insert', insert)

    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes