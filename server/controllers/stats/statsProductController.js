const Product = require("../../models/product/Product");

exports.getTotalSoldProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "totalSold"); // chỉ lấy trường totalSold
    const totalSold = products.reduce(
      (sum, product) => sum + (product.totalSold || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: { totalSold },
    });
  } catch (error) {
    console.error("Lỗi khi lấy tổng sản phẩm đã bán:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra khi truy vấn số sản phẩm đã bán.",
    });
  }
};
