<<<<<<< HEAD
// server/server.js
// Khởi tạo server sử dụng app.js chuẩn hóa
const app = require('./app');
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
=======
const express = require("express")
require("dotenv").config()
const dbConnect = require("./config/dbconnect")
const initRoutes = require("./routes")
const initOrderRoutes = require("./routes/order")
const initProductRoutes = require("./routes/product")
const initChatBotRoutes = require("./routes/chatbot")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
const port = process.env.PORT || 8888

// 1. CORS và cookieParser
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
dbConnect()

initOrderRoutes(app)
initProductRoutes(app)
initChatBotRoutes(app)
initRoutes(app)

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log("Server running on the port: " + port)
  })
}

module.exports = app;
>>>>>>> lap
