// models/User.js
const mongoose = require('mongoose');
const userBaseSchema = require('./user.schema');

const User = mongoose.model('User', userBaseSchema, 'users');
module.exports = User;
