// const userRouter = require('./user')
const brandRoutes = require('./product/branchRoutes')
// const productCategoryRouter = require('./productCategory')
// const blogCategoryRouter = require('./blogCategory')
// const blog = require('./blog')
// const brand = require('./brand')
// const coupon = require('./coupon')
// const order = require('./order')
// const insert = require('./insert')
const { notFound, errHandler } = require('../middlewares/errHandler')

const initRoutes = (app) => {
    // app.use('/api/user', userRouter)
    // app.use('/api/brand', brandRoutes)
    // app.use('/api/blogcategory', blogCategoryRouter)
    // app.use('/api/prodcategory', productCategoryRouter)
    // app.use('/api/blog', blog)
    // app.use('/api/brand', brand)
    // app.use('/api/coupon', coupon)
    // app.use('/api/order', order)
    // app.use('/api/insert', insert)

    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes