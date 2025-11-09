// modules/auth/auth.controller.js
const shopService = require("./shop.service");

//Shop

exports.createShop = async (req, res, next) => {
  try {
    const result = await shopService.createShop(req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getShopByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const [shopRes, subsRes] = await Promise.all([
      shopService.getShopByUser(userId),
      shopService.getActiveSubscription(userId),
    ]);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin cửa hàng thành công",
      shop: shopRes.shop,
      activeSubscription: subsRes.subscription,
    });
  } catch (err) {
    next(err);
  }
};

exports.getShops = async (req, res, next) => {
  try {
    const result = await shopService.getShops(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getShopDashboardStats = async (req, res, next) => {
  try {
    const result = await shopService.getShopDashboardStats(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateShop = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await shopService.updateShop(userId, req.body, req.files);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteShop = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await shopService.deleteShop(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Service Plan
 */
exports.createServicePlan = async (req, res, next) => {
  try {
    const result = await shopService.createServicePlan(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getServicePlans = async (req, res, next) => {
  try {
    const result = await shopService.getServicePlans(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateServicePlan = async (req, res, next) => {
  try {
    const { sId } = req.params;
    const result = await shopService.updateServicePlan(sId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteServicePlan = async (req, res, next) => {
  try {
    const { sId } = req.params;
    const result = await shopService.deleteServicePlan(sId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//Shop subscrible
exports.createSubscription = async (req, res, next) => {
  try {
    const result = await shopService.createSubscription(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptionsByShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const result = await shopService.getSubscriptionsByShop(shopId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const { subId } = req.params;
    const result = await shopService.cancelSubscription(subId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//Category-Shop

exports.createCategoryShop = async (req, res, next) => {
  try {
    const result = await shopService.createCategoryShop(req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCategoryShops = async (req, res, next) => {
  try {
    const result = await shopService.getCategoryShops(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCategoryShop = async (req, res, next) => {
  try {
    const { csId } = req.params;
    const { shopId } = req.body;
    const result = await shopService.updateCategoryShop(
      csId,
      shopId,
      req.body,
      req.file
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategoryShop = async (req, res, next) => {
  try {
    const { csId } = req.params;
    const result = await shopService.deleteCategoryShop(csId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
