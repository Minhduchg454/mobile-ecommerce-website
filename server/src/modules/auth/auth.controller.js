// modules/auth/auth.controller.js
const authService = require("./auth.service");

exports.registerCustomer = async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.registerAdmin(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.registerShop = async (req, res, next) => {
  try {
    const result = await authService.registerShop(req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.loginGoogle = async (req, res, next) => {
  try {
    const result = await authService.googleLogin(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
