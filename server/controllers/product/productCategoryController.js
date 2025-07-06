const ProductCategory = require("../../models/product/ProductCategory");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body);
  return res.json({
    success: response ? true : false,
    createdCategory: response ? response : "Cannot create new product-category",
  });
});
const getCategories = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find();
  return res.json({
    success: response ? true : false,
    prodCategories: response ? response : "Cannot get product-category",
  });
});
const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : "Cannot update product-category",
  });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(pcid);
  return res.json({
    success: response ? true : false,
    deletedCategory: response ? response : "Cannot delete product-category",
  });
});
const getCategoryIdByName = asyncHandler(async (req, res) => {
  const { productCategoryName } = req.query;

  if (!productCategoryName) {
    return res.status(400).json({
      success: false,
      message: "Missing category name",
    });
  }

  const response = await ProductCategory.findOne({
    productCategoryName: productCategoryName,
  });
  return res.json({
    success: response ? true : false,
    categoryId: response?._id || null,
    category: response || "Cannot find category with this name",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryIdByName,
};
