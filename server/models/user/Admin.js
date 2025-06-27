const mongoose = require('mongoose');
const userBaseSchema = require('./user.schema');

const Admin = mongoose.model('Admin', userBaseSchema, 'admins');
module.exports = Admin; 