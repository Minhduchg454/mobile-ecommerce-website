//Giup tuong tac voi mongoDB products collection
const Product = require("../../models/product/Product");
const asyncHandler = require("express-async-handler");
const ProductVariation = require("../../models/product/ProductVariation");
const { deleteProductVariationById } = require("../../ultils/databaseHelpers");

const slugify = require("slugify");

// Tạo ra một chuỗi ID ngắn duy nhất, ví dụ dùng cho mã sản phẩm (SKU).const makeSKU = require("uniqid");

// Tạo sản phẩm mới
const createProduct = asyncHandler(async (req, res) => {
  const thumb = req?.file?.path;
  if (thumb) req.body.thumb = thumb;

  const requiredFields = [
    "productName",
    "description",
    "brandId",
    "categoryId",
    "thumb",
  ];
  const missing = requiredFields.filter((field) => !req.body[field]);
  if (missing.length) {
    return res
      .status(400)
      .json({ success: false, mes: `Missing fields: ${missing.join(", ")}` });
  }
  if (!req.body.slug && req.body.productName) {
    req.body.slug = slugify(req.body.productName);
  }

  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: !!newProduct,
    createdProduct: newProduct,
    mes: newProduct ? "Created" : "Failed.",
  });
});
/*
  postman kiểm thử:
  POST http://localhost:5000/api/products
  Body:
  {
  "productName": "Samsung Galaxy S24 Ultra",
  "description": "Smartphone cao cấp với camera siêu nét và hiệu năng vượt trội.",
  "brandId": "6855b34620fcb06c67f0a1a6",
  "categoryId": "6855ba0fdffd1bd4e14fb9ff"
}
*/

//// Lấy thông tin sản phẩm theo ID và bao gồm thông tin đánh giá của sản phẩm
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const product = await Product.findById(pid)
    .populate("brandId", "brandName") // lấy tên thương hiệu
    .populate("categoryId", "productCategoryName slug"); // lấy tên danh mục

  return res.status(200).json({
    success: !!product,
    productData: product || "Cannot get product",
  });
});

// Lấy danh sách sản phẩm với các tùy chọn lọc, sắp xếp và phân trang
const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields", "q"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (match) => `$${match}`
  );

  let searchQuery = {};
  if (req.query.q) {
    const keyword = req.query.q;
    searchQuery = {
      $or: [
        { productName: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
  }

  const formatedQueries = JSON.parse(queryString);

  Object.keys(formatedQueries).forEach((key) => {
    if (key.includes("$")) {
      const [field, operator] = key.split(".");
      formatedQueries[field] = {
        ...(formatedQueries[field] || {}),
        [operator]: +formatedQueries[key],
      };
      delete formatedQueries[key];
    }
  });

  if (queries?.productName) {
    formatedQueries.productName = {
      $regex: queries.productName,
      $options: "i",
    };
  }

  // ✅ Kiểm tra hợp lệ trước khi gán brandId
  if (req.query.brandId && mongoose.Types.ObjectId.isValid(req.query.brandId)) {
    formatedQueries.brandId = req.query.brandId;
  }

  // ✅ Kiểm tra hợp lệ trước khi gán categoryId
  if (
    req.query.categoryId &&
    mongoose.Types.ObjectId.isValid(req.query.categoryId)
  ) {
    formatedQueries.categoryId = req.query.categoryId;
  }

  const finalQuery = {
    ...formatedQueries,
    ...searchQuery,
  };

  let queryCommand = Product.find(finalQuery)
    .populate("brandId", "brandName")
    .populate("categoryId", "productCategoryName slug");

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || +process.env.LIMIT_PRODUCTS || 10;
  const skip = (page - 1) * limit;
  queryCommand = queryCommand.skip(skip).limit(limit);

  queryCommand.exec(async (err, response) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    const total = await Product.countDocuments(finalQuery);
    return res.status(200).json({
      success: true,
      total,
      products: response || [],
    });
  });
});

/*
  câu truy vấn GET /api/products?q=iphone&brandId=665fabc9&price[gte]=100&price[lte]=1000&sort=price,-createdAt&page=2&limit=5
  
  req.query = {}
  q: "iphone",
    brandId: "665fabc9",
    price: { gte: "100", lte: "1000" },
    sort: "price,-createdAt",
    page: "2",
    limit: "5"
  }
  
  loại bỏ các trường không dùng để lọc:
  queries = {
    brandId: "665fabc9",
    price: { gte: "100", lte: "1000" }
  }
  
  Chuyen các toán tử so sánh:
  {
    brandId: "665fabc9",
    price: { $gte: "100", $lte: "1000" }
  }

  {
  // Tìm kiếm theo từ khóa chung (q), có từ khóa "iphone", không phân biệt chữ hoa chữ thường
    searchQuery = {
      $or: [
        { productName: { $regex: "iphone", $options: "i" } },
        { description: { $regex: "iphone", $options: "i" } }
      ]
    }
  //
  formatedQueries = {
    brandId: "665fabc9",
    price: { $gte: "100", $lte: "1000" }
  }

  // Gộp điều kiện lọc và tìm kiếm
  finalQuery = {
    brandId: "665fabc9",
    price: { $gte: "100", $lte: "1000" },
    $or: [
      { productName: { $regex: "iphone", $options: "i" } },
      { description: { $regex: "iphone", $options: "i" } }
    ]
  }
  // Tạo câu truy vấn
  queryCommand = Product.find(finalQuery)

  // Sắp xếp theo giá tăng dần, sau đó theo ngày tạo giảm dần
  queryCommand = queryCommand.sort("price -createdAt")

  // (ở đây không có fields => bỏ qua)
  // Phân trang
    page = 2
    limit = 5
    skip = (2 - 1) * 5 = 5
    queryCommand = queryCommand.skip(5).limit(5)

    Page 1: sản phẩm 1 -> 5
    Page 2: sản phẩm 6 -> 10
    Page 3: sản phẩm 11 -> 15
...
  // Thực thi truy vấn
*/

// Cập nhật thông tin sản phẩm
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req.files;
  if (files?.thumb?.length > 0) {
    req.body.thumb = files.thumb[0].path;
  }
  if (req.body && req.body.productName)
    req.body.slug = slugify(req.body.productName);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    mes: updatedProduct ? "Updated." : "Cannot update product",
  });
});

// Xóa sản phẩm
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  // 1. Lấy danh sách tất cả biến thể của sản phẩm đó va xoa bien the
  const variations = await ProductVariation.find({ productId: pid });

  if (variations.length > 0) {
    await Promise.all(variations.map((v) => deleteProductVariationById(v._id)));
  }

  //2. Xoa san pham
  const deletedProduct = await Product.findByIdAndDelete(pid);

  return res.status(200).json({
    success: deletedProduct ? true : false,
    mes: deletedProduct ? "Deleted." : "Cannot delete product",
  });
});

//Cap nhat đánh giá trung bình của sản phẩm từ tất cả các biến thể
const updateProductRating = async (productId) => {
  const variations = await ProductVariation.find({ productId });

  let totalStars = 0;
  let totalVotes = 0;

  for (const variation of variations) {
    totalStars += (variation.rating || 0) * (variation.totalRating || 0);
    totalVotes += variation.totalRating || 0;
  }

  const average = totalVotes > 0 ? (totalStars / totalVotes).toFixed(1) : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: average,
    totalRating: totalVotes,
  });
};

//Cap nhat tong so luong mua cua san pham
const updateTotalSolde = async (productId) => {};

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateProductRating,
};
