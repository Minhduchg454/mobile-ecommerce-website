const mongoose = require('mongoose');
const userBaseSchema = require('./user.schema');

const Customer = mongoose.model('Customer', userBaseSchema, 'customers');
module.exports = Customer; 