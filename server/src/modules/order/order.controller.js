const service = require("./order.service");

exports.createOrder = async (req, res, next) => {
  try {
    const result = await service.createOrder(req.body, req.app);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const result = await service.getOrders(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
exports.getOrdersByUserId = async (req, res, next) => {
  try {
    const result = await service.getOrdersByUserId(req.params, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
exports.updateOrders = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await service.updateOrders(orderId, req.body, req.app);
    res
      .status(result?.success ? 200 : 400)
      .json(result || { success: false, message: "No response from service" });
  } catch (err) {
    console.error("[Controller] Lỗi ngoài cùng:", err);
    res
      .status(500)
      .json({ success: false, error: err.message, stack: err.stack });
  }
};

exports.getOrderCountsByStatus = async (req, res, next) => {
  try {
    const result = await service.getOrderCountsByStatus(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const result = await service.getOrderById(req.params.orderId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getOrderDashboardStats = async (req, res, next) => {
  try {
    const result = await service.getOrderDashboardStats(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
