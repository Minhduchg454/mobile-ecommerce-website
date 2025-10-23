const service = require("./cart.service");

exports.getCart = async (req, res, next) => {
  try {
    const { cId } = req.params;
    const result = await service.getCart(cId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { cId } = req.params;
    const result = await service.updateCart(cId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteCart = async (req, res, next) => {
  try {
    const { cId } = req.params;
    const result = await service.deleteCart(cId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAllCarts = async (req, res, next) => {
  try {
    const result = await service.getAllCarts();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Cart Item
 */
exports.createCartItem = async (req, res, next) => {
  try {
    const result = await service.createCartItem(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCartItems = async (req, res, next) => {
  try {
    const result = await service.getCartItems({ cartId: req.query.cartId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const result = await service.updateCartItem(req.params.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  try {
    const result = await service.deleteCartItem(req.params.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCartItem = async (req, res, next) => {
  try {
    const result = await service.getCartItem(req.params.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.clearCartItems = async (req, res, next) => {
  try {
    const result = await service.clearCartItems({ cartId: req.query.cartId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCartItemCount = async (req, res, next) => {
  try {
    const result = await service.getCartItemCount({ cartId: req.query.cartId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * WishList
 */

exports.createWishList = async (req, res, next) => {
  try {
    const result = await service.createWishList(req.body); // { customerId, pvId }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getWishList = async (req, res, next) => {
  try {
    const result = await service.getWishList();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getWishListByQuery = async (req, res, next) => {
  try {
    const result = await service.getWishListByQuery(req.query);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateWishList = async (req, res, next) => {
  try {
    const { id } = req.params; // wishlist item id
    const result = await service.updateWishList(id, req.body); // { pvId }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteWishList = async (req, res, next) => {
  try {
    const { id } = req.params; // wishlist item id
    const result = await service.deleteWishList(id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteWishListByCondition = async (req, res, next) => {
  try {
    const result = await service.deleteWishListByCondition(req.query);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteAllWishListByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const result = await service.deleteAllWishListByCustomerId(customerId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
