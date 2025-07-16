const mongoose = require("mongoose");

const asyncHandler = require("express-async-handler");
const ValueOfSpecifications = require("../../models/product/ValueOfSpecifications");

// ------------GAN VOI BIEN THE --------------//

// Create new value
const createValueOfSpec = asyncHandler(async (req, res) => {
  const { value, specificationTypeId, productVariationId } = req.body;

  if (!value || !specificationTypeId || !productVariationId) {
    return res.status(400).json({
      success: false,
      mes: "Missing required fields.",
    });
  }

  const response = await ValueOfSpecifications.create({
    value,
    specificationTypeId,
    productVariationId,
  });

  res.json({
    success: !!response,
    createdValue: response || "Cannot create value of specification.",
  });
});

// Get all values
const getAllValuesOfSpecs = asyncHandler(async (req, res) => {
  const response = await ValueOfSpecifications.find()
    .populate("specificationTypeId", "typeSpecifications unitOfMeasure")
    .populate("productVariationId", "productVariationName");

  res.json({
    success: !!response,
    values: response || "Cannot get values of specifications.",
  });
});

// Get values by productVariationId
const getValuesByVariation = asyncHandler(async (req, res) => {
  const { variationId } = req.params;
  const objectId = mongoose.Types.ObjectId(variationId);

  const response = await ValueOfSpecifications.find({
    productVariationId: objectId,
  })
    .populate("specificationTypeId", "typeSpecifications unitOfMeasure")
    .populate("productVariationId", "productVariationName");
  res.json({
    success: !!response,
    values: response || "Cannot find values for this product variation.",
  });
});

// Update value
const updateValueOfSpec = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await ValueOfSpecifications.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.json({
    success: !!response,
    updatedValue: response || "Cannot update value of specification.",
  });
});

// Delete value
const deleteValueOfSpec = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await ValueOfSpecifications.findByIdAndDelete(id);

  res.json({
    success: !!response,
    deletedValue: response || "Cannot delete value of specification.",
  });
});

/* 
  ram: 685917497fb465f1b59e3dc3
  color: 685917a17fb465f1b59e3dd2
  storage: 685917517fb465f1b59e3dc6

  biến thể samsung: white, 16/512
  + 686a6c592bebfb1a90efcad9

  rawjson
   value:
   specificationTypeId
   productVariationId

*/

// ------------GAN VOI SẢN PHAM --------------//

const createValueOfSpecForProduct = asyncHandler(async (req, res) => {
  // console.log("value of duoc goi", req.body);
  const { value, specificationTypeId, productId } = req.body;

  if (!value || !specificationTypeId || !productId) {
    return res.status(400).json({
      success: false,
      mes: "Missing required fields.",
    });
  }

  const response = await ValueOfSpecifications.create({
    value,
    specificationTypeId,
    productId,
  });

  res.json({
    success: !!response,
    createdValue: response || "Cannot create value for product specification.",
  });
});

const getValuesByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const response = await ValueOfSpecifications.find({
    productId: mongoose.Types.ObjectId(productId),
  })
    .populate("specificationTypeId", "typeSpecifications unitOfMeasure")
    .populate("productId", "productName");

  res.json({
    success: !!response,
    values: response || "Cannot find values for this product.",
  });
});

const updateValueOfSpecForProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await ValueOfSpecifications.findOneAndUpdate(
    { _id: id, productId: { $ne: null } },
    req.body,
    { new: true }
  );

  res.json({
    success: !!response,
    updatedValue: response || "Cannot update value for product specification.",
  });
});

const deleteValueOfSpecForProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await ValueOfSpecifications.findOneAndDelete({
    _id: id,
    productId: { $ne: null },
  });

  res.json({
    success: !!response,
    deletedValue: response || "Cannot delete value for product specification.",
  });
});

module.exports = {
  // Existing variation-based controllers
  createValueOfSpec,
  getAllValuesOfSpecs,
  getValuesByVariation,
  updateValueOfSpec,
  deleteValueOfSpec,

  // New product-based controllers
  createValueOfSpecForProduct,
  getValuesByProduct,
  updateValueOfSpecForProduct,
  deleteValueOfSpecForProduct,
};
