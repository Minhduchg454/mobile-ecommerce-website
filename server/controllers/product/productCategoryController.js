// controllers/productCategory.js
const ProductCategory = require("../../models/product/ProductCategory");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Product = require("../../models/product/Product");

// CREATE
const createCategory = asyncHandler(async (req, res) => {
  const { productCategoryName } = req.body;
  const file = req?.file;

  if (!productCategoryName || !file)
    return res.status(400).json({
      success: false,
      message: "Missing productCategoryName or thumbnail image",
    });

  const slug = slugify(productCategoryName, { lower: true });

  const category = await ProductCategory.create({
    productCategoryName,
    slug,
    thumb: file.path, // Cloudinary trả về link URL tại đây
  });

  return res.json({
    success: category ? true : false,
    createdCategory: category || "Cannot create new product category",
  });
});

// GET ALL
const getCategories = asyncHandler(async (req, res) => {
  const { sort } = req.query;

  let sortOption = {};
  if (sort === "oldest") {
    sortOption.createdAt = 1; // cũ nhất trước
  } else if (sort === "newest") {
    sortOption.createdAt = -1; // mới nhất trước
  }
  const categories = await ProductCategory.find().sort(sortOption);
  return res.json({
    success: categories ? true : false,
    prodCategories: categories || "Cannot get product categories",
  });
});

// UPDATE
const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const file = req?.file;

  let dataUpdate = { ...req.body };

  if (dataUpdate.productCategoryName)
    dataUpdate.slug = slugify(dataUpdate.productCategoryName, { lower: true });

  if (file) dataUpdate.thumb = file.path; // Cloudinary URL

  const updated = await ProductCategory.findByIdAndUpdate(pcid, dataUpdate, {
    new: true,
  });

  return res.json({
    success: updated ? true : false,
    updatedCategory: updated || "Cannot update product category",
  });
});

// DELETE
const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const isUsed = await Product.findOne({ categoryId: pcid });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Không thể xoá danh mục vì đang được sử dụng bởi sản phẩm.",
    });
  }

  const deleted = await ProductCategory.findByIdAndDelete(pcid);
  return res.json({
    success: deleted ? true : false,
    deletedCategory: deleted || "Cannot delete product category",
  });
});

// GET CATEGORY BY NAME
const getCategoryIdByName = asyncHandler(async (req, res) => {
  const { productCategoryName } = req.query;
  if (!productCategoryName)
    return res.status(400).json({ success: false, message: "Missing name" });

  const category = await ProductCategory.findOne({ slug: productCategoryName });
  return res.json({
    success: category ? true : false,
    categoryId: category?._id,
    category: category || "Cannot find category with this name",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryIdByName,
};
