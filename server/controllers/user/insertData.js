// controllers/user/insertData.js
// Chức năng: Insert dữ liệu mẫu cho Product và ProductCategory
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const data = require('../../data/data2.json')
const slugify = require('slugify')
const categoryData = require('../../data/cate_brand')
const ProductCategory = require('../models/productCategory')

// Hàm hỗ trợ: Tạo mới một sản phẩm từ dữ liệu mẫu
const fn = async (product) => {
    await Product.create({
        title: product?.name, // Tên sản phẩm
        slug: slugify(product?.name) + Math.round(Math.random() * 100) + '', // Tạo slug duy nhất
        description: product?.description, // Mô tả sản phẩm
        brand: product?.brand, // Thương hiệu
        price: Math.round(Number(product?.price?.match(/\d/g).join('')) / 100), // Giá sản phẩm
        category: product?.category[1], // Danh mục
        quantity: Math.round(Math.random() * 1000), // Số lượng ngẫu nhiên
        sold: Math.round(Math.random() * 100), // Số lượng đã bán ngẫu nhiên
        images: product?.images, // Ảnh sản phẩm
        color: product?.variants?.find(el => el.label === 'Color')?.variants[0] || 'BLACK', // Màu sắc
        thumb: product?.thumb, // Ảnh đại diện
        totalRatings: 0 // Tổng số đánh giá ban đầu
    })
}

// API: Insert toàn bộ sản phẩm mẫu vào DB
const insertProduct = asyncHandler(async (req, res) => {
    const promises = []
    for (let product of data) promises.push(fn(product))
    await Promise.all(promises)
    return res.json('Done')
})

// Hàm hỗ trợ: Tạo mới một danh mục sản phẩm từ dữ liệu mẫu
const fn2 = async (cate) => {
    await ProductCategory.create({
        title: cate?.cate, // Tên danh mục
        brand: cate?.brand, // Thương hiệu liên quan
        image: cate?.image // Ảnh đại diện danh mục
    })
}

// API: Insert toàn bộ danh mục mẫu vào DB
const insertCategory = asyncHandler(async (req, res) => {
    const promises = []
    for (let cate of categoryData) promises.push(fn2(cate))
    await Promise.all(promises)
    return res.json('Done')
})

// Export các hàm để sử dụng ở router
module.exports = {
    insertProduct,
    insertCategory
}