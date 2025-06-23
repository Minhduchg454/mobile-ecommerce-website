const asyncHandler = require('express-async-handler');
const ValueOfSpecifications = require('../../models/product/ValueOfSpecifications');

// Create new value
const createValueOfSpec = asyncHandler(async (req, res) => {
  const { value, specificationTypeId, productVariationId } = req.body;

  if (!value || !specificationTypeId || !productVariationId) {
    return res.status(400).json({
      success: false,
      mes: 'Missing required fields.'
    });
  }

  const response = await ValueOfSpecifications.create({
    value,
    specificationTypeId,
    productVariationId
  });

  res.json({
    success: !!response,
    createdValue: response || 'Cannot create value of specification.'
  });
});

// Get all values
const getAllValuesOfSpecs = asyncHandler(async (req, res) => {
  const response = await ValueOfSpecifications.find()
    .populate('specificationTypeId', 'typeSpecifications unitOfMeasure')
    .populate('productVariationId', 'productVariationName');

  res.json({
    success: !!response,
    values: response || 'Cannot get values of specifications.'
  });
});

// Get values by productVariationId
const getValuesByVariation = asyncHandler(async (req, res) => {
  const { variationId } = req.params;
  const response = await ValueOfSpecifications.find({ productVariationId: variationId })
    .populate('specificationTypeId');

  res.json({
    success: !!response,
    values: response || 'Cannot find values for this product variation.'
  });
});

// Update value
const updateValueOfSpec = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await ValueOfSpecifications.findByIdAndUpdate(id, req.body, { new: true });

  res.json({
    success: !!response,
    updatedValue: response || 'Cannot update value of specification.'
  });
});

// Delete value
const deleteValueOfSpec = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await ValueOfSpecifications.findByIdAndDelete(id);

  res.json({
    success: !!response,
    deletedValue: response || 'Cannot delete value of specification.'
  });
});

module.exports = {
  createValueOfSpec,
  getAllValuesOfSpecs,
  getValuesByVariation,
  updateValueOfSpec,
  deleteValueOfSpec
};