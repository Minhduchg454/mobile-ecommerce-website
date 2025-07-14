const CouponProductVariation = require("../../models/product/couponProductVariation");
const asyncHandler = require("express-async-handler");

//Tạo mới liên kết giữa coupon và variation
const createCouponProductVariation = asyncHandler(async (req, res) => {
  const { couponId, variationId } = req.body;
  if (!couponId || !variationId) {
    return res.status(400).json({
      success: false,
      message: "Missing coupon or variation ID",
    });
  }

  const response = await CouponProductVariation.create({
    couponId,
    variationId,
  });

  return res.json({
    success: !!response,
    created: response || "Cannot create coupon-product-variation link",
  });
});

// Lấy tất cả liên kết coupon-variation
const getCouponProductVariations = asyncHandler(async (req, res) => {
  const response = await CouponProductVariation.find()
    .populate("coupon", "couponCode discount discountType") // Hiển thị thông tin coupon
    .populate("variation", "productId price stock"); // Hiển thị thông tin variation

  return res.json({
    success: !!response,
    data: response || "Cannot get data",
  });
});

//Cập nhật liên kết (hiếm khi dùng, nhưng có thể hỗ trợ)
const updateCouponProductVariation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.body.coupon && !req.body.variation) {
    return res.status(400).json({
      success: false,
      message: "Nothing to update",
    });
  }

  const response = await CouponProductVariation.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  return res.json({
    success: !!response,
    updated: response || "Cannot update coupon-product-variation",
  });
});

//  Xóa liên kết
const deleteCouponProductVariation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await CouponProductVariation.findByIdAndDelete(id);

  return res.json({
    success: !!response,
    deleted: response || "Cannot delete coupon-product-variation",
  });
});

module.exports = {
  createCouponProductVariation,
  getCouponProductVariations,
  updateCouponProductVariation,
  deleteCouponProductVariation,
};
