const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const Payment = require("./entities/payment.model");
const mongoose = require("mongoose");

// Giữ nguyên y hệt sample
function sortObject(obj) {
  const sorted = {};
  const keys = [];
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      keys.push(encodeURIComponent(k));
    }
  }
  keys.sort();
  for (let i = 0; i < keys.length; i++) {
    // Lưu ý: encodeURIComponent cho value + thay %20 -> '+'
    sorted[keys[i]] = encodeURIComponent(obj[keys[i]]).replace(/%20/g, "+");
  }
  return sorted;
}

const ALLOWED_STATUS = ["Pending", "Completed", "Failed", "Refunded"];
const ALLOWED_METHOD = ["VNpay", "COD", "QR"];

// -------- helpers ----------
function buildSort(sortStr) {
  // ví dụ: sort=-createdAt,paymentAmount
  if (!sortStr) return { createdAt: -1 };
  const sort = {};
  sortStr.split(",").forEach((f) => {
    const k = f.trim();
    if (!k) return;
    if (k.startsWith("-")) sort[k.slice(1)] = -1;
    else sort[k] = 1;
  });
  return sort;
}

function buildFilter(q = {}) {
  const filter = {};

  // theo orderId
  if (q.orderId && mongoose.isValidObjectId(q.orderId)) {
    filter.orderId = q.orderId;
  }

  // theo method
  if (q.paymentMethod && ALLOWED_METHOD.includes(q.paymentMethod)) {
    filter.paymentMethod = q.paymentMethod;
  }

  // theo status
  if (q.paymentStatus && ALLOWED_STATUS.includes(q.paymentStatus)) {
    filter.paymentStatus = q.paymentStatus;
  }

  // theo amount
  if (q.minAmount || q.maxAmount) {
    filter.paymentAmount = {};
    if (q.minAmount) filter.paymentAmount.$gte = Number(q.minAmount);
    if (q.maxAmount) filter.paymentAmount.$lte = Number(q.maxAmount);
  }

  // theo thời gian (paymentDate hoặc createdAt)
  if (q.from || q.to) {
    filter.paymentDate = {};
    if (q.from) filter.paymentDate.$gte = new Date(q.from);
    if (q.to) filter.paymentDate.$lte = new Date(q.to);
  }

  return filter;
}

// ============== CREATE ==============
exports.createPayment = async (body = {}) => {
  const {
    paymentStatus = "Pending",
    paymentMethod,
    paymentAmount,
    orderId,
    paymentDate,
  } = body;

  // validate bắt buộc
  if (!paymentMethod || paymentAmount == null || !orderId) {
    const err = new Error("Thiếu paymentMethod, paymentAmount hoặc orderId");
    err.status = 400;
    throw err;
  }
  if (!ALLOWED_METHOD.includes(paymentMethod)) {
    const err = new Error("paymentMethod không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (!ALLOWED_STATUS.includes(paymentStatus)) {
    const err = new Error("paymentStatus không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (!mongoose.isValidObjectId(orderId)) {
    const err = new Error("orderId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const doc = await Payment.create({
    paymentStatus,
    paymentMethod,
    paymentAmount: Number(paymentAmount) || 0,
    orderId,
    ...(paymentDate ? { paymentDate: new Date(paymentDate) } : {}),
  });

  return {
    success: true,
    message: "Tạo payment thành công",
    payment: doc.toObject(),
  };
};

// ============== UPDATE ==============
exports.updatePayment = async (paymentId, patch = {}) => {
  if (!mongoose.isValidObjectId(paymentId)) {
    const err = new Error("paymentId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const update = {};

  if ("paymentStatus" in patch) {
    if (!ALLOWED_STATUS.includes(patch.paymentStatus)) {
      const err = new Error("paymentStatus không hợp lệ");
      err.status = 400;
      throw err;
    }
    update.paymentStatus = patch.paymentStatus;
  }
  if ("paymentMethod" in patch) {
    if (!ALLOWED_METHOD.includes(patch.paymentMethod)) {
      const err = new Error("paymentMethod không hợp lệ");
      err.status = 400;
      throw err;
    }
    update.paymentMethod = patch.paymentMethod;
  }
  if ("paymentDate" in patch) {
    update.paymentDate = patch.paymentDate
      ? new Date(patch.paymentDate)
      : new Date();
  }
  if ("paymentAmount" in patch) {
    update.paymentAmount = Number(patch.paymentAmount) || 0;
  }
  if ("orderId" in patch) {
    if (!mongoose.isValidObjectId(patch.orderId)) {
      const err = new Error("orderId không hợp lệ");
      err.status = 400;
      throw err;
    }
    update.orderId = patch.orderId;
  }

  const updated = await Payment.findByIdAndUpdate(paymentId, update, {
    new: true,
  });

  if (!updated) {
    const err = new Error("Không tìm thấy payment");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Cập nhật payment thành công",
    payment: updated.toObject(),
  };
};

// ============== DELETE ==============
exports.deletePayment = async (paymentId) => {
  if (!mongoose.isValidObjectId(paymentId)) {
    const err = new Error("paymentId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const del = await Payment.findByIdAndDelete(paymentId);
  if (!del) {
    const err = new Error("Không tìm thấy payment");
    err.status = 404;
    throw err;
  }

  return {
    success: true,
    message: "Xóa payment thành công",
    payment: del.toObject(),
  };
};

exports.getPayments = async (q = {}) => {
  const filter = buildFilter(q);
  const sort = buildSort(q.sort);

  // populate order nếu cần (tùy bạn)
  const populateOrder = q.populateOrder === "true";

  let query = Payment.find(filter).sort(sort);
  if (populateOrder) {
    query = query.populate("orderId"); // có thể truyền select: "orderTotalPrice ..."
  }

  // không phân trang; nếu muốn an toàn giới hạn:
  const limit = q.limit ? Number(q.limit) : undefined;
  if (limit && Number.isFinite(limit)) {
    query = query.limit(limit);
  }

  const data = await query.lean();

  return {
    success: true,
    data,
  };
};

/**
 * VNpay
 */
exports.createPaymentVNpay = async (body, ipAddr) => {
  const { amount, bankCode, orderInfo } = body;
  if (!amount || isNaN(amount)) {
    const err = new Error("Thiếu hoặc sai định dạng amount");
    err.status = 400;
    throw err;
  }

  const vnp_TmnCode = process.env.VNP_TMN_CODE;
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const vnp_Url = process.env.VNP_URL;
  const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

  const createDate = moment().format("YYYYMMDDHHmmss");
  const orderId = moment().format("DDHHmmss");

  const info = orderInfo || `Thanh toan cho ma GD:${orderId}`;

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: info,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: createDate,
  };
  if (bankCode) vnp_Params.vnp_BankCode = bankCode;

  // 1) encode & sort theo sample
  vnp_Params = sortObject(vnp_Params);

  // 2) build chuỗi ký KHÔNG encode thêm (vì đã encode tay ở bước trên)
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // 3) gắn signature vào param
  vnp_Params["vnp_SecureHash"] = signed;

  // 4) build URL cuối
  const paymentUrl =
    vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });

  return { success: true, message: "OK", paymentUrl, orderId };
};

exports.verifyVNPayChecksum = async (query) => {
  const secureHash = query["vnp_SecureHash"];

  delete query["vnp_SecureHash"];
  delete query["vnp_SecureHashType"];

  const sorted = sortObject(query);

  const signData = require("qs").stringify(sorted, { encode: false });
  const signed = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return { isValid: secureHash === signed, data: sorted };
};
