const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: false }); // Không tự sinh _id mới

module.exports = mongoose.model('Admin', adminSchema, 'admins'); 