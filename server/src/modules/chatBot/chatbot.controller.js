const service = require("./chatbot.service");

exports.getResponse = async (req, res, next) => {
  try {
    const result = await service.getResponse(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
