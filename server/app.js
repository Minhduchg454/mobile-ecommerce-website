const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/dbconnect");
require("dotenv").config();
const { notFound, errHandler } = require("./middlewares/errHandler");

// ✅ Đặt middleware parse JSON sớm nhất có thể
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

dbConnect();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

const initProductRoutes = require("./routes/product/index.js");
const initOrderRoutes = require("./routes/order/index.js");
const initChatBotRoutes = require("./routes/chatbot/index.js");
const userRouter = require("./routes/user");
const initOAuthRoutes = require("./routes/auth/index.js");
const initStatsRoutes = require("./routes/stats/index.js");

initOAuthRoutes(app);
initProductRoutes(app);
initOrderRoutes(app);
initChatBotRoutes(app);
initStatsRoutes(app);
app.use("/api", userRouter);

app.use(notFound);
app.use(errHandler);

module.exports = app;
