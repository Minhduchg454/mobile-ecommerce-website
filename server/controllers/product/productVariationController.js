const ProductVariation = require('../../models/product/ProductVariation')
const asyncHandler = require('express-async-handler')

// Tạo mới biến thể sản phẩm
const createProductVariation = asyncHandler(async (req, res) => {
  const {
    productVariationName,
    price,
    stockQuantity,
    sold,
    image,
    productId
  } = req.body

  if (!productVariationName || price == null || stockQuantity == null || sold == null || !productId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields.'
    })
  }

  const response = await ProductVariation.create(req.body)
  return res.json({
    success: !!response,
    createdVariation: response || 'Cannot create variation'
  })
})

// Lấy tất cả biến thể sản phẩm
const getProductVariations = asyncHandler(async (req, res) => {
  const response = await ProductVariation.find()
    .populate('productId', 'productName thumb') // optional: lấy tên sản phẩm
  return res.json({
    success: !!response,
    variations: response || 'Cannot get variations'
  })
})

// Lấy một biến thể theo ID
const getProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params
  const response = await ProductVariation.findById(pvid)
    .populate('productId', 'productName thumb')
  return res.json({
    success: !!response,
    variation: response || 'Cannot get variation'
  })
})

// Cập nhật một biến thể
const updateProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params
  const response = await ProductVariation.findByIdAndUpdate(pvid, req.body, { new: true })
  return res.json({
    success: !!response,
    updatedVariation: response || 'Cannot update variation'
  })
})

// Xoá một biến thể
const deleteProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params
  const response = await ProductVariation.findByIdAndDelete(pvid)
  return res.json({
    success: !!response,
    deletedVariation: response || 'Cannot delete variation'
  })
})


// Upload nhiều hình ảnh cho ProductVariation
const uploadImagesProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params

  if (!req.files || req.files.length === 0)
    throw new Error("Missing image files")

  const imagePaths = req.files.map(file => file.path)

  // Cập nhật: thêm mảng ảnh mới vào field `images`
  const response = await ProductVariation.findByIdAndUpdate(
    pvid,
    { $push: { images: { $each: imagePaths } } },
    { new: true }
  )

  return res.status(200).json({
    success: !!response,
    updatedVariation: response || "Cannot upload images to product variation"
  })
})




module.exports = {
  createProductVariation,
  getProductVariations,
  getProductVariation,
  updateProductVariation,
  deleteProductVariation
}