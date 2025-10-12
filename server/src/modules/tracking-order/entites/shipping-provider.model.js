// models/ShippingProvider.js
const mongoose = require("mongoose");

const shippingProviderSchema = new mongoose.Schema({
  spName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  spWebsite: {
    type: String,
    trim: true,
  },
  spHotline: {
    type: String,
  },
});

module.exports = mongoose.model("ShippingProvider", shippingProviderSchema);
