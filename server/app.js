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

// ✅ Kết nối database
dbConnect();

// ✅ Middleware CORS và cookieParser
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

// ✅ ROUTES
const authRoutes = require("./routes/auth.route.js");
app.use("/api/auth", authRoutes);

const initProductRoutes = require("./routes/product/index.js");
const initOrderRoutes = require("./routes/order/index.js");
const initChatBotRoutes = require("./routes/chatbot/index.js");

const userRouter = require("./routes/user");
initProductRoutes(app);
initOrderRoutes(app);
initChatBotRoutes(app);
app.use("/api", userRouter);

// ✅ Error middleware
app.use(notFound);
app.use(errHandler);

module.exports = app;
