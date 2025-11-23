const service = require("./payment.service");

// ===== Tạo URL VNpay thanh toán =====
exports.createPaymentVNpay = async (req, res, next) => {
  try {
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress?.replace("::1", "127.0.0.1") ||
      req.socket?.remoteAddress?.replace("::1", "127.0.0.1") ||
      "127.0.0.1";
    const result = await service.createPaymentVNpay(req.body, ipAddr);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.vnpayReturn = async (req, res) => {
  const { isValid, data } = await service.verifyVNPayChecksum(req.query);

  const frontBase = process.env.CLIENT_URL;
  const purpose = req.query.purpose || "";
  const returnPath = req.query.returnPath || "/checkout/result";

  const qs = new URLSearchParams();

  if (!isValid) {
    qs.set("status", "fail");
    qs.set("reason", "invalid-signature");
    qs.set("paymentMethod", "VNPay");
    if (purpose) qs.set("purpose", purpose);

    return res.redirect(`${frontBase}${returnPath}?${qs.toString()}`);
  }

  const isSuccess = data.vnp_ResponseCode === "00";

  qs.set("status", isSuccess ? "success" : "fail");
  qs.set("paymentMethod", "VNPay");
  qs.set("orderId", data.vnp_TxnRef);
  qs.set("amount", Number(data.vnp_Amount) / 100);
  qs.set("code", data.vnp_ResponseCode);
  if (purpose) qs.set("purpose", purpose);

  return res.redirect(`${frontBase}${returnPath}?${qs.toString()}`);
};

// ===== IPN callback (VNPay gọi ngược lại để xác nhận server-to-server) =====
exports.vnpayIPN = async (req, res, next) => {
  try {
    const { isValid, data } = await service.verifyVNPayChecksum(req.query);
    if (!isValid)
      return res.json({ RspCode: "97", Message: "Invalid Checksum" });

    // Nếu thành công
    if (data.vnp_ResponseCode === "00" && data.vnp_TransactionStatus === "00") {
      // TODO: cập nhật trạng thái đơn hàng trong DB
      return res.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      return res.json({ RspCode: "01", Message: "Transaction Failed" });
    }
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const result = await service.createPayment(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách thanh toán (hỗ trợ filter qua query)
exports.getPayments = async (req, res, next) => {
  try {
    const result = await service.getPayments(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Lấy chi tiết 1 thanh toán theo id
exports.getPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const result = await service.getPaymentById(paymentId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Cập nhật thanh toán theo id (patch)
exports.updatePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const result = await service.updatePayment(paymentId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Xóa thanh toán theo id
exports.deletePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const result = await service.deletePayment(paymentId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
