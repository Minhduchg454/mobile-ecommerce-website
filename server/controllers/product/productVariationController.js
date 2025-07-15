const ProductVariation = require("../../models/product/ProductVariation");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {
  updateMinPrice,
  deleteProductVariationById,
  updateTotalStock,
  deleteValuesByVariation,
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
  let query = ProductVariation.find();

  // Lọc theo các trường trong biến thể
  const filter = {};
  if (req.query.price) {
    const priceQuery = req.query.price;
    Object.keys(priceQuery).forEach((op) => {
      filter.price = { ...filter.price, [`$${op}`]: Number(priceQuery[op]) };
    });
  }

  if (req.query.productVariationName) {
    filter.productVariationName = {
      $regex: req.query.productVariationName,
      $options: "i",
    };
  }

  // Gắn filter vào query
  query = query.find(filter);

  // Populate
  query = query.populate({
    path: "productId",
    select:
      "productName thumb categoryId brandId slug minPrice totalSold totalStock rating totalRating",
    populate: [
      { path: "categoryId", select: "productCategoryName slug" },
      { path: "brandId", select: "brandName" },
    ],
  });

  const variations = await query.exec();
  let finalResult = variations;

  if (req.query.categoryId) {
    finalResult = finalResult.filter(
      (v) => v.productId?.categoryId?._id?.toString() === req.query.categoryId
    );
  }

  if (req.query.brandId) {
    finalResult = finalResult.filter(
      (v) => v.productId?.brandId?._id?.toString() === req.query.brandId
    );
  }

  // Xử lý sort
  const sortOption = req.query.sort;
  if (sortOption) {
    const jsSortMap = {
      "-minPrice": (a, b) => b.productId?.minPrice - a.productId?.minPrice,
      minPrice: (a, b) => a.productId?.minPrice - b.productId?.minPrice,
      "-totalSold": (a, b) => b.productId?.totalSold - a.productId?.totalSold,
      totalSold: (a, b) => a.productId?.totalSold - b.productId?.totalSold,
      "-rating": (a, b) => b.productId?.rating - a.productId?.rating,
      rating: (a, b) => a.productId?.rating - b.productId?.rating,
      nameAsc: (a, b) =>
        a.productId?.productName?.localeCompare(b.productId?.productName),
      nameDesc: (a, b) =>
        b.productId?.productName?.localeCompare(a.productId?.productName),
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    };

    const jsSortFunc = jsSortMap[sortOption];
    if (jsSortFunc) {
      finalResult.sort(jsSortFunc);
    }
  }
  //Loc theo thuong hieu
  if (req.query.brandName) {
    finalResult = finalResult.filter((v) =>
      v.productId?.brandId?.brandName
        ?.toLowerCase()
        .includes(req.query.brandName.toLowerCase())
    );
  }

  // Lọc theo tên sản phẩm nếu có query.q
  if (req.query.q) {
    const keyword = req.query.q.toLowerCase();
    finalResult = finalResult.filter(
      (v) =>
        v.productId?.productName &&
        v.productId.productName.toLowerCase().includes(keyword)
    );
  }

  // Lọc bỏ các biến thể không có productId
  finalResult = finalResult.filter((v) => v.productId !== null);

  res.json({
    success: true,
    count: finalResult.length,
    variations: finalResult,
  });
});

// Lấy một biến thể theo ID
const getProductVariation = asyncHandler(async (req, res) => {
  const { pvid } = req.params;
  const response = await ProductVariation.findById(pvid).populate({
    path: "productId",
    select:
      "productName thumb categoryId brandId slug minPrice totalSold totalStock rating totalRating",
    populate: [
      { path: "categoryId", select: "productCategoryName slug" },
      { path: "brandId", select: "brandName" },
    ],
  });
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

  await deleteValuesByVariation(pvid);

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
