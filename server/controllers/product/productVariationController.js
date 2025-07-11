const ProductVariation = require("../../models/product/ProductVariation");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {
  updateMinPrice,
  deleteProductVariationById,
  updateTotalStock,
} = require("../../ultils/databaseHelpers");

// Tạo mới biến thể sản phẩm
const createProductVariation = asyncHandler(async (req, res) => {
  try {
    let { productVariationName, price, stockQuantity, productId } = req.body;

    // Ép kiểu vì form-data gửi chuỗi
    price = Number(price);
    stockQuantity = Number(stockQuantity);

    // Kiểm tra thiếu
    const missingFields = [];
    if (!productVariationName) missingFields.push("productVariationName");
    if (isNaN(price)) missingFields.push("price");
    if (isNaN(stockQuantity)) missingFields.push("stockQuantity");
    if (!productId) missingFields.push("productId");
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Tạo slug nếu chưa có
    const slug = req.body.slug || slugify(productVariationName);

    // Xử lý hình ảnh (multer-cloudinary trả về mảng path)
    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.path)
        : [];

    // Tạo đối tượng để lưu vào DB
    const newVariation = {
      productVariationName,
      price,
      stockQuantity,
      productId,
      slug,
      images,
    };

    const response = await ProductVariation.create(newVariation);

    if (response) {
      await updateMinPrice(productId);
      await updateTotalStock(productId);
    }

    return res.json({
      success: !!response,
      createdVariation: response || "Cannot create variation",
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({
        success: false,
        message: `Slug đã tồn tại. Vui lòng đổi tên biến thể.`,
      });
    }

    console.error("Lỗi khi tạo biến thể:", error);
    return res.status(500).json({
      success: false,
      message: "Tạo biến thể thất bại",
      error: error.message,
    });
  }
});

// Lấy tất cả biến thể sản phẩm
const getProductVariations = asyncHandler(async (req, res) => {
  const response = await ProductVariation.find().populate(
    "productId",
    "productName thumb"
  ); // optional: lấy tên sản phẩm
  return res.json({
    success: !!response,
    variations: response || "Cannot get variations",
  });
});

// Lấy một biến thể theo ID
const getProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params;
  const response = await ProductVariation.findById(pvid).populate(
    "productId",
    "productName thumb"
  );
  return res.json({
    success: !!response,
    variation: response || "Cannot get variation",
  });
});

//Lay tat ca bien the theo productId
const getProductVariationsByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const response = await ProductVariation.find({ productId }).populate(
    "productId",
    "productName thumb"
  );

  return res.json({
    success: !!response,
    variations: response || "No variations found for this product.",
  });
});

// Cập nhật một biến thể
const updateProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params;

  // Nếu có file ảnh mới
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => file.path);
  }

  // Ép kiểu nếu cần
  if (req.body.price) req.body.price = Number(req.body.price);
  if (req.body.stockQuantity)
    req.body.stockQuantity = Number(req.body.stockQuantity);
  if (req.body.sold) req.body.sold = Number(req.body.sold);

  // Nếu có tên nhưng chưa có slug
  if (req.body.productVariationName && !req.body.slug) {
    req.body.slug = slugify(req.body.productVariationName);
  }

  const oldVariation = await ProductVariation.findById(pvid);
  const response = await ProductVariation.findByIdAndUpdate(pvid, req.body, {
    new: true,
  });

  if (response && oldVariation?.productId) {
    await updateMinPrice(oldVariation.productId); // ← cập nhật lại giá thấp nhất
    await updateTotalStock(oldVariation.productId);
  }

  return res.json({
    success: !!response,
    updatedVariation: response || "Cannot update variation",
  });
});

// Xoá một biến thể
const deleteProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params;
  const response = await deleteProductVariationById(pvid);
  return res.json({
    success: !!response,
    deletedVariation: response || "Cannot delete variation",
  });
});

// Upload nhiều hình ảnh cho ProductVariation
const uploadImagesProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params;

  if (!req.files || req.files.length === 0)
    throw new Error("Missing image files");

  const imagePaths = req.files.map((file) => file.path);

  // Cập nhật: thêm mảng ảnh mới vào field `images`
  const response = await ProductVariation.findByIdAndUpdate(
    pvid,
    { $push: { images: { $each: imagePaths } } },
    { new: true }
  );

  return res.status(200).json({
    success: !!response,
    updatedVariation: response || "Cannot upload images to product variation",
  });
});

module.exports = {
  createProductVariation,
  getProductVariations,
  getProductVariation,
  updateProductVariation,
  deleteProductVariation,
  uploadImagesProductVariation,
  getProductVariationsByProductId,
};
