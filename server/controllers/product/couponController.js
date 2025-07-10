const Coupon = require("../../models/product/Coupon");
const asyncHandler = require("express-async-handler");

const createNewCoupon = asyncHandler(async (req, res) => {
  const {
    description,
    discount,
    discountType,
    expirationDate,
    couponCode,
    usageLimit,
    miniOrderAmount,
    userId,
  } = req.body;

  const missingFields = [];
  if (!discount) missingFields.push("discount");
  if (!discountType) missingFields.push("discountType");
  if (!expirationDate) missingFields.push("expirationDate");
  if (!userId) missingFields.push("userId");

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      mes: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  const response = await Coupon.create({
    ...req.body,
    couponCode: couponCode?.toUpperCase() || undefined,
  });

  return res.json({
    success: !!response,
    createdCoupon: response || "Cannot create new coupon",
  });
});

/*
    {
        "description": "Giảm giá 20% cho đơn hàng trên 500k",
        "discount": 20,
        "discountType": "percentage",
        "startDate": "2025-06-22T00:00:00.000Z",
        "expirationDate": "2025-07-01T00:00:00.000Z",
        "couponCode": "SALE20",
        "isActive": true,
        "usageLimit": 100,
        "miniOrderAmount": 500000,
        "userId": "6856f1c15230b77f9ac8fbe5"
    }
*/

const getCoupons = asyncHandler(async (req, res) => {
  const response = await Coupon.find()
    //.populate('firstName', 'lastName') // Lấy thông tin admin tạo coupon
    .select("-createdAt -updatedAt -__v");

  return res.json({
    success: !!response,
    coupons: response || "Cannot get coupons",
  });
});

const getSingleCoupon = asyncHandler(async (req, res) => {
  const { id, code } = req.query;

  if (!id && !code) {
    return res.status(400).json({
      success: false,
      mes: "Missing coupon ID or coupon code",
    });
  }

  // Nếu có id thì tìm theo _id
  let query = {};
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, mes: "Invalid coupon ID" });
    }
    query._id = id;
  }

  // Nếu có code thì tìm theo couponCode (ưu tiên code nếu có cả 2)
  if (code) {
    query = { couponCode: code.toUpperCase().trim() };
  }

  const response = await Coupon.findOne(query)
    //.populate('userId', 'firstName lastName')
    .select("-createdAt -updatedAt -__v");

  return res.status(200).json({
    success: !!response,
    coupon: response || "Coupon not found",
  });
});

/*
    GET /api/coupons/single?code=SALE20
    GET /api/coupons/single?id=<theo _id>
*/

const updateCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({ success: false, mes: "Missing inputs" });

  // Nếu người dùng gửi lại couponCode, chuyển sang in hoa
  if (req.body.couponCode)
    req.body.couponCode = req.body.couponCode.toUpperCase();

  const response = await Coupon.findByIdAndUpdate(cid, req.body, { new: true });

  return res.json({
    success: !!response,
    updatedCoupon: response || "Cannot update coupon",
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const response = await Coupon.findByIdAndDelete(cid);

  return res.json({
    success: !!response,
    deletedCoupon: response || "Cannot delete coupon",
  });
});

module.exports = {
  createNewCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getSingleCoupon,
};

/*
    const createNewCoupon = asyncHandler(async (req, res) => {
    const { name, discount, expiry } = req.body
    if (!name || !discount || !expiry) throw new Error('Missing inputs')
    const response = await Coupon.create({
        ...req.body,
        expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000
    })
    return res.json({
        success: response ? true : false,
        createdCoupon: response ? response : 'Cannot create new coupon'
    })
})

const getCoupons = asyncHandler(async (req, res) => {
    const response = await Coupon.find().select('-createdAt -updatedAt')
    return res.json({
        success: response ? true : false,
        coupons: response ? response : 'Cannot get coupons'
    })
})



const updateCoupon = asyncHandler(async (req, res) => {
    const { cid } = req.params
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body.expiry) req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000
    const response = await Coupon.findByIdAndUpdate(cid, req.body, { new: true })
    return res.json({
        success: response ? true : false,
        updatedCoupon: response ? response : 'Cannot update coupon'
    })
})
const deleteCoupon = asyncHandler(async (req, res) => {
    const { cid } = req.params
    const response = await Coupon.findByIdAndDelete(cid)
    return res.json({
        success: response ? true : false,
        deletedCoupon: response ? response : 'Cannot delete coupon'
    })
})


*/
