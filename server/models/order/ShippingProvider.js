// models/ShippingProvider.js
const mongoose = require('mongoose');

const shippingProviderSchema = new mongoose.Schema({
    providerName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    providerWebsite: {
        type: String,
        trim: true
    },
    providerHotline: {
        type: String // NumberDouble
    }
});

module.exports = mongoose.model('ShippingProvider', shippingProviderSchema);