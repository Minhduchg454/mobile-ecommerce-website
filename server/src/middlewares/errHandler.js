// middlewares/error.js

const notFound = (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.status = 404;
  next(err); // day loi xuong middlewares ke tiep co err ~ errorHandler
};

// 2) Error handler tổng
const errHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server error",
  });
};

module.exports = {
  notFound,
  errHandler,
};
