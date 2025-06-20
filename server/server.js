const express = require("express")
require("dotenv").config()
const dbConnect = require("./config/dbconnect")
const initRoutes = require("./routes")
const initOrderRoutes = require("./routes/order")
const initProductRoutes = require("./routes/product")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
)
app.use(cookieParser())
const port = process.env.PORT || 8888
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
dbConnect()
initOrderRoutes(app)
initProductRoutes(app)
initRoutes(app)

app.listen(port, () => {
  console.log("Server running on the port: " + port)
})
