// Khai báo bảng dữ liệu Brand
const Brand = require("../../models/product/Brand");
const Product = require("../../models/product/Product");
// Khai báo các hàm xử lý liên quan đến Brand, không cần dùng try/catch vì đã sử dụng express-async-handler
const asyncHandler = require("express-async-handler");

const createNewBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body);
  return res.json({
    success: response ? true : false, // Kiểm tra xem response có dữ liệu hay không, nếu có là true, nếu không thì false
    createdBrand: response ? response : "Cannot create new brand", // Trả về dữ liệu brand mới tạo, nếu không có thì trả về thông báo lỗi
  });
});

const getBrands = asyncHandler(async (req, res) => {
  const { sort } = req.query;
  let sortOption = {};
  if (sort === "oldest") {
    sortOption.createdAt = 1; // cũ nhất trước
  } else if (sort === "newest") {
    sortOption.createdAt = -1; // mới nhất trước
  }

  const response = await Brand.find().sort(sortOption);

  return res.json({
    success: response ? true : false,
    brands: response ? response : "Cannot get brand",
  });
});

const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndUpdate(bid, req.body, { new: true });
  return res.json({
    success: response ? true : false,
    updatedBrand: response ? response : "Cannot update brand",
  });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;

  const isUsed = await Product.exists({ brandId: bid });
  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Không thể xóa thương hiệu đang được sử dụng bởi sản phẩm.",
    });
  }

  const response = await Brand.findByIdAndDelete(bid);
  return res.json({
    success: response ? true : false,
    deletedBrand: response || "Cannot delete brand",
  });
});

module.exports = {
  createNewBrand,
  getBrands,
  updateBrand,
  deleteBrand,
};
