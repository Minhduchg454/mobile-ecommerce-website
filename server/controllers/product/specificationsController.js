const Specifications = require('../../models/product/Specifications');
const asyncHandler = require('express-async-handler');

// Tạo mới Specifications
const createSpecification = asyncHandler(async (req, res) => {
  const { typeSpecifications, unitOfMeasure } = req.body;

  if (!typeSpecifications) {
    return res.status(400).json({
      success: false,
      mes: 'Missing required field: typeSpecifications'
    });
  }

  const existing = await Specifications.findOne({ typeSpecifications });
  if (existing) {
    return res.status(400).json({
      success: false,
      mes: 'This specification type already exists'
    });
  }

  const response = await Specifications.create({ typeSpecifications, unitOfMeasure });

  return res.status(201).json({
    success: !!response,
    createdSpecification: response || "Failed to create specification"
  });
});

// Lấy danh sách tất cả Specifications
const getSpecifications = asyncHandler(async (req, res) => {
  const response = await Specifications.find().select('-__v -createdAt -updatedAt');
  return res.json({
    success: !!response,
    specifications: response || 'Cannot get specifications'
  });
});

// Cập nhật Specifications
const updateSpecification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const response = await Specifications.findByIdAndUpdate(id, req.body, { new: true });

  return res.json({
    success: !!response,
    updatedSpecification: response || 'Cannot update specification'
  });
});

// Xoá Specifications
const deleteSpecification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const response = await Specifications.findByIdAndDelete(id);

  return res.json({
    success: !!response,
    deletedSpecification: response || 'Cannot delete specification'
  });
});

module.exports = {
  createSpecification,
  getSpecifications,
  updateSpecification,
  deleteSpecification
};