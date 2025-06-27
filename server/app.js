// app.js
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbconnect');
require('dotenv').config();
const { notFound, errHandler } = require('./middlewares/errHandler');

// Kết nối database
dbConnect();

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware CORS và cookieParser
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
    credentials: true,
  })
);
app.use(cookieParser());

// Import unified user router
const userRouter = require('./routes/user');

// Mount unified user router
app.use('/api', userRouter);

// Middleware xử lý lỗi
app.use(notFound);
app.use(errHandler);

module.exports = app; 