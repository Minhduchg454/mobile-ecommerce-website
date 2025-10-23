const service = require("./customer.service");
exports.getCartByCustomerId = async (req, res, next) => {
  try {
    const { cId } = req.params;
    const result = await service.getCartByCustomerId(cId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
