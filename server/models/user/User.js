// models/User.js
const mongoose = require('mongoose');
const userSchema = require('./user.schema');

// Model User sử dụng schema chung từ user.schema.js
module.exports = mongoose.model('User', userSchema);
