const googleAuthRoutes = require("./googleRoute");

function initOAuthRoutes(app) {
  app.use("/api/auth", googleAuthRoutes);
}
module.exports = initOAuthRoutes;
