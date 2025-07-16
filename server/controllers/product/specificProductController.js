const SpecificProduct = require("../../models/product/SpecificProduct");
const asyncHandler = require("express-async-handler");

// Tạo mới SpecificProduct
const createSpecificProduct = asyncHandler(async (req, res) => {
  const { numberOfSeri, productVariationId } = req.body;

  if (!numberOfSeri || !productVariationId) {
    throw new Error("Missing inputs");
  }

  const response = await SpecificProduct.create({
    numberOfSeri,
    productVariationId,
  });

  res.status(201).json({
    success: !!response,
    createdSpecificProduct: response || "Cannot create specific product",
  });
});

// Lấy danh sách tất cả SpecificProduct
const getSpecificProducts = asyncHandler(async (req, res) => {
  const response = await SpecificProduct.find()
    .populate("productVariationId", "productVariationName price")
    .select("-createdAt -updatedAt");

  res.status(200).json({
    success: !!response,
    specificProducts: response || "Cannot get specific products",
  });
});

// Lấy một sản phẩm cụ thể theo ID
const getSpecificProduct = asyncHandler(async (req, res) => {
  const { spid } = req.params;
  const response = await SpecificProduct.findById(spid).populate(
    "productVariationId",
    "productVariationName price"
  );

  res.status(200).json({
    success: !!response,
    specificProduct: response || "Not found",
  });
});

// Cập nhật sản phẩm cụ thể
const updateSpecificProduct = asyncHandler(async (req, res) => {
  const { spid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(spid)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu dữ liệu cập nhật" });
  }

  const response = await SpecificProduct.findByIdAndUpdate(spid, req.body, {
    new: true,
  });

  if (!response) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm cụ thể để cập nhật",
    });
  }

  res.status(200).json({
    success: true,
    updatedSpecificProduct: response,
  });
});

// Xoá sản phẩm cụ thể
const deleteSpecificProduct = asyncHandler(async (req, res) => {
  const { spid } = req.params;

  const response = await SpecificProduct.findByIdAndDelete(spid);

  res.status(200).json({
    success: !!response,
    deletedSpecificProduct: response || "Cannot delete specific product",
  });
});

// Lấy danh sách SpecificProduct theo productVariationId
const getSpecificProductsByVariationId = asyncHandler(async (req, res) => {
  const { pvid } = req.params;

  const response = await SpecificProduct.find({ productVariationId: pvid });

  return res.status(200).json({
    success: true,
    specificProducts: response, // luôn là mảng, có thể là []
  });
});

module.exports = {
  createSpecificProduct,
  getSpecificProducts,
  getSpecificProduct,
  updateSpecificProduct,
  deleteSpecificProduct,
  getSpecificProductsByVariationId,
};
