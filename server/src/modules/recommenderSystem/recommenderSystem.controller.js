const recommendationService = require("./recommenderSystem.service");

exports.getRecommendationsForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const limit = Number(req.query.limit) || 20;

    if (!userId) {
      const err = new Error("Thiếu userId trong tham số.");
      err.status = 400;
      throw err;
    }

    const result = await recommendationService.getRecommendedProducts(
      userId,
      limit
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
