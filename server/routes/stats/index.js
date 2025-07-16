const userStatsRoutes = require("./userStatsRoutes");
const productStatRoute = require("./productStatsRoutes");

function initStatsRoutes(app) {
  app.use("/api/stats/user", userStatsRoutes);
  app.use("/api/stats/products", productStatRoute);
}

module.exports = initStatsRoutes;
