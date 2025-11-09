// controllers/coupon.controller.js
const service = require("./coupon.service");

/**
 * Coupon
 */
exports.createCoupon = async (req, res, next) => {
  try {
    const result = await service.createCoupon(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCoupons = async (req, res, next) => {
  try {
    const result = await service.getCoupons(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCouponByCode = async (req, res, next) => {
  try {
    const result = await service.getCouponByCode(req.params.couponCode);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const result = await service.updateCoupon(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const result = await service.deleteCoupon(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
