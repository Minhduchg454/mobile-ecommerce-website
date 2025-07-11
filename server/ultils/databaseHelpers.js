const Product = require("../models/product/Product");
const asyncHandler = require("express-async-handler");
const ProductVariation = require("../models/product/ProductVariation");

const updateMinPrice = async (productId) => {
  const variations = await ProductVariation.find({ productId });
  if (!variations || variations.length === 0) {
    await Product.findByIdAndUpdate(productId, { minPrice: 0 });
    return;
  }

  const minPrice = Math.min(...variations.map((v) => v.price));
  await Product.findByIdAndUpdate(productId, { minPrice });
};

const deleteProductVariationById = async (pvid) => {
  const oldVariation = await ProductVariation.findById(pvid);
  const response = await ProductVariation.findByIdAndDelete(pvid);
  if (response && oldVariation?.productId) {
    await updateMinPrice(oldVariation.productId);
    await updateTotalStock(oldVariation.productId);
  }
  return response;
};

const updateTotalStock = async (productId) => {
  try {
    const variations = await ProductVariation.find({ productId });

    if (!variations || variations.length === 0) {
      await Product.findByIdAndUpdate(productId, { totalStock: 0 });
      return;
    }

    const totalStock = variations.reduce(
      (sum, v) => sum + (v.stockQuantity || 0),
      0
    );

    const updated = await Product.findByIdAndUpdate(
      productId,
      { totalStock },
      { new: true }
    );
  } catch (error) {
    console.error("Lỗi cập nhật totalStock:", error);
  }
};

module.exports = {
  updateMinPrice,
  deleteProductVariationById,
  updateTotalStock,
};
