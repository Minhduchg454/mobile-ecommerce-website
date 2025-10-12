const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/dbconnect.js");
require("dotenv").config();
const { notFound, errHandler } = require("./middlewares/errHandler");
const mainRoutes = require("./routes/index.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

dbConnect();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

//import routes
app.use("/api/v1", mainRoutes);

//import middleware loi
app.use(notFound);
app.use(errHandler);

module.exports = app;
