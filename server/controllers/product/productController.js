//Giup tuong tac voi mongoDB products collection
const Product = require("../../models/product/Product");
const asyncHandler = require("express-async-handler");
const ProductVariation = require("../../models/product/ProductVariation");

// Thư viện slugify để tạo slug từ tiêu đề sản phẩm
//vd: "Áo thun nam" => "ao-thun-nam", thuong dung de tao duuong dan url
const slugify = require("slugify");

// Tạo ra một chuỗi ID ngắn duy nhất, ví dụ dùng cho mã sản phẩm (SKU).
const makeSKU = require("uniqid");

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
    success: newProduct ? true : false,
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
    .populate("categoryId", "productCategoryName"); // lấy tên danh mục

  return res.status(200).json({
    success: !!product,
    productData: product || "Cannot get product",
  });
});

// Lấy danh sách sản phẩm với các tùy chọn lọc, sắp xếp và phân trang
const getProducts = asyncHandler(async (req, res) => {
  // Lấy tất cả các query từ request
  const queries = { ...req.query };

  // 1. Loại bỏ các field không dùng để filter, chỉ giữ lại các trường có thể lọc trực tiếp
  //q: là tư khoá tông quát, không dùng để lọc
  //sort: là sắp xếp, không dùng để lọc
  //page: là phân trang, không dùng để lọc
  //fields: là giới hạn trường trả về, không dùng để lọc
  //limit: là giới hạn số lượng sản phẩm trả về, không dùng để lọc
  const excludeFields = ["limit", "sort", "page", "fields", "q"];
  excludeFields.forEach((el) => delete queries[el]);

  // 2. Format lại các toán tử như gte, lte, gt, lt...
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (match) => `$${match}`
  );

  // 3. Tìm kiếm theo keyword toàn cục nếu có (?q=iphone)
  // Áp dụng cho chuỗi
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
  // 3.1 Nếu có tìm kiếm theo tên sản phẩm (productName) → dùng regex
  if (queries?.productName) {
    formatedQueries.productName = {
      $regex: queries.productName,
      $options: "i",
    };
  }

  // 4. Nếu người dùng gửi brandId hoặc categoryId (ở dạng ObjectId) → lọc trực tiếp (không dùng regex)
  if (req.query.brandId) {
    formatedQueries.brandId = req.query.brandId;
  }

  if (req.query.categoryId) {
    formatedQueries.categoryId = req.query.categoryId;
  }

  // 5. Tổng hợp điều kiện lọc (filter + search)
  const finalQuery = {
    ...formatedQueries,
    ...searchQuery,
  };

  // 6. Tạo câu truy vấn
  let queryCommand = Product.find(finalQuery)
    .populate("brandId", "brandName") // lấy tên thương hiệu
    .populate("categoryId", "productCategoryName"); // lấy tên danh mục

  // 7. Sắp xếp nếu có (?sort=price,-createdAt)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // 8. Giới hạn trường nếu có (?fields=productName,price)
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // 9. Phân trang
  // Giúp chia danh sách sản phẩm thành từng trang nhỏ thay vì trả về toàn bộ dữ liệu cùng lúc.
  const page = +req.query.page || 1;
  const limit = +req.query.limit || +process.env.LIMIT_PRODUCTS || 10; // Mặc định là 10 sản phẩm mỗi trang
  const skip = (page - 1) * limit; // Tính số lượng sản phẩm cần bỏ qua
  queryCommand = queryCommand.skip(skip).limit(limit);

  // 10. Thực thi truy vấn
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
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

const updateMinPrice = async (productId) => {
  const variations = await ProductVariation.find({ productId });
  if (!variations || variations.length === 0) {
    await Product.findByIdAndUpdate(productId, { minPrice: 0 });
    return;
  }

  const minPrice = Math.min(...variations.map((v) => v.price));
  await Product.findByIdAndUpdate(productId, { minPrice });
};

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateProductRating,
  updateMinPrice,
};

/*
  cũ
  //// Lấy thông tin sản phẩm theo ID và bao gồm thông tin đánh giá của sản phẩm
const getProduct = asyncHandler(async (req, res) => {
  // Lấy thông tin sản phẩm theo ID
  const { pid } = req.params

  const product = await Product.findById(pid).populate({
    path: "ratings",
    populate: {
      path: "postedBy",
      select: "firstname lastname avatar",
    },
  })
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product",
  })
})
*/

/*

  // Tách các trường đặc biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"]
  excludeFields.forEach((el) => delete queries[el])
  /*
    loại bỏ các trường không cần thiết, các trường không dùng để lọc, sắp xếp, phân trang
    chỉ giữ lại các trường cần thiết để lọc
    queries = {
      brandId: '664f0f...',
      price: { gte: '1000' }
    }
  

  // Format lại các operators cho đúng cú pháp mongoose
  // Ví dụ: { gte: 100 } => { $gte: 100 }
  let queryString = JSON.stringify(queries)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  )


  /*
    tìm kiếm mờ (regex) không phân biet chữ hoa chữ thường
  
  const formatedQueries = JSON.parse(queryString)
  let colorQueryObject = {}
  if (queries?.title)
    formatedQueries.title = { $regex: queries.title, $options: "i" }
  if (queries?.category)
    formatedQueries.category = { $regex: queries.category, $options: "i" }
  if (queries?.brand)
    formatedQueries.brand = { $regex: queries.brand, $options: "i" }

  /*
  📌 Nếu lọc nhiều màu (color=red,blue):
    → dùng $or để tìm sản phẩm có ít nhất một màu.
    🧪 Trả về sản phẩm có color khớp với red hoặc blue.
  
  if (queries?.color) {
    delete formatedQueries.color
    const colorArr = queries.color?.split(",")
    const colorQuery = colorArr.map((el) => ({
      color: { $regex: el, $options: "i" },
    }))
    colorQueryObject = { $or: colorQuery }
  }


  // Tìm theo từ khóa chung `q` (tên, mô tả, danh mục, thương hiệu)
  /*
  📌 Cho phép tìm theo từ khóa tổng quát (vd: ?q=apple)
  → tìm trên nhiều trường: color, title, category, brand.
  
  let queryObject = {}
  if (queries?.q) {
    delete formatedQueries.q
    queryObject = {
      $or: [
        { color: { $regex: queries.q, $options: "i" } },
        { title: { $regex: queries.q, $options: "i" } },
        { category: { $regex: queries.q, $options: "i" } },
        { brand: { $regex: queries.q, $options: "i" } },
        // { description: { $regex: queries.q, $options: 'i' } },
      ],
    }
  }

  /*
  📌 Gộp:
	•	Điều kiện chính (formatedQueries)
	•	Màu (colorQueryObject)
	•	Global search (queryObject)

  → tạo ra truy vấn đầy đủ gửi tới MongoDB.
  
  const qr = { ...colorQueryObject, ...formatedQueries, ...queryObject }
  let queryCommand = Product.find(qr)

  // Sorting
  /*
  🧪 ?sort=price,-createdAt
  → sắp theo price tăng, rồi ngày tạo giảm
  
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    queryCommand = queryCommand.sort(sortBy)
  }

  // Fields limiting
  /*
  📌 Cho phép chọn trường trả về (vd: ?fields=title,price
  
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ")
    queryCommand = queryCommand.select(fields)
  }

  // Pagination
  /*
  📌 Phân trang với page và limit
    √📌 Tính vị trí bắt đầu (skip) và số lượng mỗi trang (limit)

  🧪 ?page=2&limit=10 → bỏ qua 10 sản phẩm đầu, lấy từ 11–20

  📌 queryCommand.exec() → chạy truy vấn đã cấu hình ở trên.
	•	response: danh sách sản phẩm trả về (phân trang)
	•	counts: tổng số sản phẩm khớp với điều kiện (chưa phân trang)


  const page = +req.query.page || 1
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
  const skip = (page - 1) * limit
  queryCommand.skip(skip).limit(limit)
  // Execute query
  // Số lượng sp thỏa mãn điều kiện !== số lượng sp trả về 1 lần gọi API
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message)
    const counts = await Product.find(qr).countDocuments()
    return res.status(200).json({
      success: response ? true : false,
      counts,
      products: response ? response : "Cannot get products",
    })
  })
})
*/

/*
 Cũ
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const files = req?.files
  if (files?.thumb) req.body.thumb = files?.thumb[0]?.path
  if (files?.images) req.body.images = files?.images?.map((el) => el.path)
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  })
  return res.status(200).json({
    success: updatedProduct ? true : false,
    mes: updatedProduct ? "Updated." : "Cannot update product",
  })
})
*/

// Đánh giá sản phẩm
/*
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { star, comment, pid, updatedAt } = req.body
  if (!star || !pid) throw new Error("Missing inputs")
  const ratingProduct = await Product.findById(pid)
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  )
  // console.log(alreadyRating);
  if (alreadyRating) {
    // update star & comment
    await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRating },
      },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      { new: true }
    )
  } else {
    // add star & comment
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    )
  }

  // Sum ratings
  const updatedProduct = await Product.findById(pid)
  const ratingCount = updatedProduct.ratings.length
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, el) => sum + +el.star,
    0
  )
  updatedProduct.totalRatings = Math.round((sumRatings * 10) / ratingCount) / 10

  await updatedProduct.save()

  return res.status(200).json({
    success: true,
    updatedProduct,
  })
})

*/

// Upload images for product
/*
const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  if (!req.files) throw new Error("Missing inputs")
  const response = await Product.findByIdAndUpdate(
    pid,
    { $push: { images: { $each: req.files.map((el) => el.path) } } },
    { new: true }
  )
  return res.status(200).json({
    success: response ? true : false,
    updatedProduct: response ? response : "Cannot upload images product",
  })
})
*/

/*
// Thêm mảng biến thể (variant) cho sản phẩm
const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const { title, price, color } = req.body
  const thumb = req?.files?.thumb[0]?.path
  const images = req.files?.images?.map((el) => el.path)
  if (!(title && price && color)) throw new Error("Missing inputs")
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: {
        varriants: {
          color,
          price,
          title,
          thumb,
          images,
          sku: makeSKU().toUpperCase(),
        },
      },
    },
    { new: true }
  )
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Added varriant." : "Cannot upload images product",
  })
})
*/
