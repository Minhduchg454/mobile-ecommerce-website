const Product = require("../models/product/Product");
const asyncHandler = require("express-async-handler");
const ProductVariation = require("../models/product/ProductVariation");
const ValueOfSpecifications = require("../models/product/ValueOfSpecifications");
const SpecificProduct = require("../models/product/SpecificProduct");

const updateMinPrice = async (productId) => {
  const variations = await ProductVariation.find({ productId });
  if (!variations || variations.length === 0) {
    await Product.findByIdAndUpdate(productId, { minPrice: 0 });
    return;
  }

  const minPrice = Math.min(...variations.map((v) => v.price));
  await Product.findByIdAndUpdate(productId, { minPrice });
};

const deleteValuesByVariation = async (variationId) => {
  const response = await ValueOfSpecifications.deleteMany({
    productVariationId: variationId,
  });
  return response.deletedCount;
};

// ✅ Hàm API handler cho router (khác hoàn toàn)
const deleteValuesByVariationHandler = asyncHandler(async (req, res) => {
  const { variationId } = req.params;

  if (!variationId) {
    return res.status(400).json({
      success: false,
      mes: "Missing variationId.",
    });
  }

  const deletedCount = await deleteValuesByVariation(variationId);

  res.json({
    success: true,
    deletedCount,
    mes: `${deletedCount} value(s) deleted.`,
  });
});

const updateTotalStock = async (productId) => {
  try {
    const variations = await ProductVariation.find({ productId });
    const totalStock = variations.reduce(
      (sum, v) => sum + (v.stockQuantity || 0),
      0
    );
    const totalSold = variations.reduce((sum, v) => sum + (v.sold || 0), 0);
    await Product.findByIdAndUpdate(productId, { totalStock, totalSold });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin sản phẩm:", error);
  }
};

const deleteProductVariationById = async (pvid) => {
  await deleteValuesByVariation(pvid); // dùng hàm helper nội bộ

  const oldVariation = await ProductVariation.findById(pvid);
  const response = await ProductVariation.findByIdAndDelete(pvid);

  if (response && oldVariation?.productId) {
    await updateMinPrice(oldVariation.productId);
    await updateTotalStock(oldVariation.productId);
  }

  return response;
};

const deleteSpecificProductsByVariation = async (variationId) => {
  await SpecificProduct.deleteMany({ productVariationId: variationId });
};

module.exports = {
  updateMinPrice,
  deleteProductVariationById,
  updateTotalStock,
  deleteValuesByVariation, // dùng nội bộ
  deleteValuesByVariationHandler, // dùng cho router
  deleteSpecificProductsByVariation,
};
