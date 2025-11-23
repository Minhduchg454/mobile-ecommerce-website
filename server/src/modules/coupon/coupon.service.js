const mongoose = require("mongoose");
const Coupon = require("./entities/coupon.model");

// ========== Helpers ==========
const nowUTC = () => new Date();

function validateDateWindow(start, end) {
  if (!end) {
    const err = new Error("Thiếu ngày hết hạn");
    err.status = 400;
    throw err;
  }
  const s = start ? new Date(start) : nowUTC();
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    const err = new Error("Ngày không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (e < s) {
    const err = new Error("Ngày hết hạn phải lớn hơn ngày bắt đầu");
    err.status = 400;
    throw err;
  }
  if (e <= nowUTC()) {
    const err = new Error("Ngày hết hạn phải lớn hơn ngày hiện tại");
    err.status = 400;
    throw err;
  }
}

function validateDateWindowStrict(start, end) {
  if (!end) {
    const err = new Error("Thiếu ngày hết hạn");
    err.status = 400;
    throw err;
  }
  const s = start ? new Date(start) : new Date(0);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    const err = new Error("Ngày không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (e <= s) {
    const err = new Error("Ngày hết hạn phải lớn hơn ngày bắt đầu");
    err.status = 400;
    throw err;
  }
}

async function syncExpiredCoupons() {
  const now = nowUTC();
  await Coupon.updateMany(
    {
      couponExpirationDate: { $lt: nowUTC() },
      couponIsActive: true, // chỉ tắt nếu đang bật
      isDeleted: false,
    },
    { $set: { couponIsActive: false } }
  );
}

// ========== Services ==========

// Tạo coupon
exports.createCoupon = async (body) => {
  const required = [
    "couponCode",
    "couponDiscountType",
    "couponDiscount",
    "couponExpirationDate",
    "createdByType",
    "createdById",
  ];

  const missing = required.filter(
    (k) => body[k] === undefined || body[k] === null
  );
  if (missing.length) {
    const err = new Error(`Missing fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  body.couponCode = String(body.couponCode).trim().toUpperCase();
  if (!["percentage", "fixed_amount"].includes(body.couponDiscountType)) {
    const err = new Error(
      "couponDiscountType phải là 'percentage' hoặc 'fixed_amount'"
    );
    err.status = 400;
    throw err;
  }
  if (Number(body.couponDiscount) < 0) {
    const err = new Error("couponDiscount phải >= 0");
    err.status = 400;
    throw err;
  }
  if (!["Shop", "Admin"].includes(body.createdByType)) {
    const err = new Error("createdByType phải là 'Shop' hoặc 'Admin'");
    err.status = 400;
    throw err;
  }

  validateDateWindow(body.couponStartDate, body.couponExpirationDate);

  const existed = await Coupon.findOne({
    couponCode: body.couponCode,
    isDeleted: false,
  }).lean();
  if (existed) {
    const err = new Error("couponCode đã tồn tại");
    err.status = 409;
    throw err;
  }

  const coupon = await Coupon.create(body);
  return {
    success: true,
    message: "Tạo coupon thành công",
    coupon,
  };
};

// Lấy danh sách coupon (lọc linh hoạt)
exports.getCoupons = async (query = {}) => {
  const {
    s,
    type,
    isActive,
    createdByType,
    createdById,
    sort = "-createdAt",
    limit = 20,
  } = query;

  await syncExpiredCoupons();

  const filter = { isDeleted: false };

  if (s) {
    const keyword = String(s).trim();
    filter.$or = [
      { couponCode: { $regex: keyword, $options: "i" } },
      { couponDescription: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filter.couponDiscountType = {
      $in: String(type)
        .split(",")
        .map((v) => v.trim()),
    };
  }

  if (createdByType) {
    filter.createdByType = {
      $in: String(createdByType)
        .split(",")
        .map((v) => v.trim()),
    };
  }

  if (createdById) {
    const ids = String(createdById)
      .split(",")
      .map((x) => x.trim());
    filter.createdById = { $in: ids };
  }

  if (isActive === `true` || isActive === true) filter.couponIsActive = true;
  if (isActive === `false` || isActive === false) filter.couponIsActive = false;

  const sortOption = {};
  if (typeof sort === "string") {
    sort.split(",").forEach((f) => {
      const field = f.trim();
      if (!field) return;
      sortOption[field.startsWith("-") ? field.slice(1) : field] =
        field.startsWith("-") ? -1 : 1;
    });
  }

  const coupons = await Coupon.find(filter)
    .sort(sortOption)
    .limit(Number(limit))
    .lean();

  return {
    success: true,
    message: "Lấy danh sách coupon thành công",
    coupons,
  };
};

// Lấy 1 coupon theo code
exports.getCouponByCode = async (couponCode) => {
  if (!couponCode) {
    const err = new Error("Thiếu coupon code");
    err.status = 400;
    throw err;
  }
  await syncExpiredCoupons();

  const coupon = await Coupon.findOne({
    couponCode: String(couponCode).trim().toUpperCase(),
    isDeleted: false,
  });

  if (!coupon) {
    const err = new Error("Không tìm thấy coupon");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Lấy coupon thành công",
    coupon,
  };
};

// Cập nhật coupon
exports.updateCoupon = async (couponId, body) => {
  if (!couponId || !mongoose.isValidObjectId(couponId)) {
    err.status = 400;
    throw err;
  }

  const ex = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!ex) {
    const err = new Error("Không tìm thấy coupon để cập nhật");
    err.status = 404;
    throw err;
  }

  if (body.createdByType !== undefined || body.createdById !== undefined) {
    const err = new Error("Không được thay đổi createdByType/createdById");
    err.status = 400;
    throw err;
  }

  if (body.couponCode) {
    const nextCode = String(body.couponCode).trim().toUpperCase();
    const dup = await Coupon.findOne({
      _id: { $ne: ex._id },
      couponCode: nextCode,
      isDeleted: false,
    }).lean();
    if (dup) {
      const err = new Error("couponCode đã tồn tại");
      err.status = 409;
      throw err;
    }
    body.couponCode = nextCode;
  }

  const nextStart = body.couponStartDate ?? ex.couponStartDate ?? null;
  const nextEnd = body.couponExpirationDate ?? ex.couponExpirationDate;
  validateDateWindowStrict(nextStart, nextEnd);

  const now = new Date();
  if (body.couponIsActive === undefined || body.couponIsActive === null) {
    // Nếu không truyền couponIsActive -> tự động bật/tắt dựa theo hạn
    const now = new Date();
    const start = nextStart ? new Date(nextStart) : null;
    const end = new Date(nextEnd);

    const isInValidPeriod = (!start || start <= now) && end > now;
    body.couponIsActive = body.couponIsActive ?? isInValidPeriod;
  } else {
    // Nếu truyền couponIsActive -> ưu tiên giá trị đó
    body.couponIsActive = Boolean(body.couponIsActive);
  }

  const updated = await Coupon.findByIdAndUpdate(
    ex._id,
    { $set: body },
    { new: true, runValidators: true }
  );

  return {
    success: true,
    message: "Cập nhật coupon thành công",
    coupon: updated,
  };
};

// Xóa mềm coupon
exports.deleteCoupon = async (couponId) => {
  if (!mongoose.isValidObjectId(couponId)) {
    const err = new Error("couponId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: { isDeleted: true, deletedAt: nowUTC() } },
    { new: true }
  );

  if (!coupon) {
    const err = new Error("Không tìm thấy coupon để xóa");
    err.status = 404;
    throw err;
  }

  return { success: true, message: "Đã xóa coupon (mềm)", coupon };
};

// Khôi phục coupon đã xóa
exports.restoreCoupon = async (couponId) => {
  if (!mongoose.isValidObjectId(couponId)) {
    const err = new Error("couponId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: { isDeleted: false, deletedAt: null } },
    { new: true }
  );

  if (!coupon) {
    const err = new Error("Không tìm thấy coupon để khôi phục");
    err.status = 404;
    throw err;
  }

  return { success: true, message: "Khôi phục coupon thành công", coupon };
};

// Dùng coupon
exports.useCoupon = async (couponCode, quantity = 1) => {
  const qty = Math.max(1, Math.floor(quantity));
  const code = String(couponCode).trim().toUpperCase();

  const coupon = await Coupon.findOne({ couponCode: code, isDeleted: false });
  if (!coupon) {
    const err = new Error("Không tìm thấy coupon");
    err.status = 404;
    throw err;
  }

  if (
    typeof coupon.couponUsageLimit === "number" &&
    coupon.couponUsageLimit >= 0 &&
    coupon.couponUsedCount + qty > coupon.couponUsageLimit
  ) {
    const err = new Error("Coupon đã đạt giới hạn sử dụng");
    err.status = 400;
    throw err;
  }

  const updated = await Coupon.findOneAndUpdate(
    { _id: coupon._id, couponUsedCount: coupon.couponUsedCount },
    { $inc: { couponUsedCount: qty } },
    { new: true }
  );

  if (!updated) {
    const err = new Error(
      "Cập nhật lượt dùng coupon thất bại (race condition)"
    );
    err.status = 500;
    throw err;
  }

  return {
    success: true,
    message: "Áp dụng coupon thành công",
    coupon: {
      couponCode: updated.couponCode,
      couponUsedCount: updated.couponUsedCount,
      couponUsageLimit: updated.couponUsageLimit,
    },
  };
};

// Hoàn lượt coupon
exports.refundCoupon = async (couponCode, quantity = 1) => {
  const qty = Math.max(1, Math.floor(quantity));
  const code = String(couponCode).trim().toUpperCase();

  const updated = await Coupon.findOneAndUpdate(
    { couponCode: code, couponUsedCount: { $gte: qty }, isDeleted: false },
    { $inc: { couponUsedCount: -qty } },
    { new: true }
  );

  if (!updated) {
    const err = new Error(
      "Không thể hoàn coupon: đã dùng quá hoặc không tồn tại"
    );
    err.status = 400;
    throw err;
  }

  return {
    success: true,
    message: "Hoàn coupon thành công",
    coupon: {
      couponCode: updated.couponCode,
      couponUsedCount: updated.couponUsedCount,
    },
  };
};
