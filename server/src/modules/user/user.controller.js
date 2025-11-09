const userService = require("./user.service");

exports.getCurrent = async (req, res, next) => {
  try {
    //Truyen qua query ?id=... =>req.query
    //Truyen qua params url: /__/__/current/:id
    const result = await userService.getCurrent(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.query);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.uId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { uId } = req.params;
    const result = await userService.updateUser(uId, req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Address
 */
exports.createAddress = async (req, res, next) => {
  try {
    const result = await userService.createAddress(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const result = await userService.getAddresses(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;
    const result = await userService.updateAddress(addressId, userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;
    const result = await userService.deleteAddress(addressId, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
