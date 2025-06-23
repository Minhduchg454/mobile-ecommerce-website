const SpecificProduct = require('../../models/product/SpecificProduct')
const asyncHandler = require('express-async-handler')

// Tạo mới SpecificProduct
const createSpecificProduct = asyncHandler(async (req, res) => {
  const { numberOfSeri, productVariationId } = req.body

  if (!numberOfSeri || !productVariationId) {
    throw new Error('Missing inputs')
  }

  const response = await SpecificProduct.create({ numberOfSeri, productVariationId })

  res.status(201).json({
    success: !!response,
    createdSpecificProduct: response || 'Cannot create specific product'
  })
})

// Lấy danh sách tất cả SpecificProduct
const getSpecificProducts = asyncHandler(async (req, res) => {
  const response = await SpecificProduct.find()
    .populate('productVariationId', 'productVariationName price')
    .select('-createdAt -updatedAt')

  res.status(200).json({
    success: !!response,
    specificProducts: response || 'Cannot get specific products'
  })
})

// Lấy một sản phẩm cụ thể theo ID
const getSpecificProduct = asyncHandler(async (req, res) => {
  const { spid } = req.params
  const response = await SpecificProduct.findById(spid)
    .populate('productVariationId', 'productVariationName price')

  res.status(200).json({
    success: !!response,
    specificProduct: response || 'Not found'
  })
})

// Cập nhật sản phẩm cụ thể
const updateSpecificProduct = asyncHandler(async (req, res) => {
  const { spid } = req.params

  if (Object.keys(req.body).length === 0) throw new Error('Missing update data')

  const response = await SpecificProduct.findByIdAndUpdate(spid, req.body, { new: true })

  res.status(200).json({
    success: !!response,
    updatedSpecificProduct: response || 'Cannot update specific product'
  })
})

// Xoá sản phẩm cụ thể
const deleteSpecificProduct = asyncHandler(async (req, res) => {
  const { spid } = req.params
  const response = await SpecificProduct.findByIdAndDelete(spid)

  res.status(200).json({
    success: !!response,
    deletedSpecificProduct: response || 'Cannot delete specific product'
  })
})


// Lấy danh sách SpecificProduct theo productVariationId
const getSpecificProductsByVariationId = asyncHandler(async (req, res) => {
  const { pvid } = req.params;

  const response = await SpecificProduct.find({ productVariationId: pvid });

  return res.status(200).json({
    success: !!response,
    specificProducts: response.length ? response : 'No specific products found for this variation'
  });
});


module.exports = {
  createSpecificProduct,
  getSpecificProducts,
  getSpecificProduct,
  updateSpecificProduct,
  deleteSpecificProduct,
  getSpecificProductsByVariationId 
}