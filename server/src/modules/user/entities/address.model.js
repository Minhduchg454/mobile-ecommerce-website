const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  addressUserName: {
    type: String,
    required: true,
    trim: true,
  },
  addressNumberPhone: {
    type: String,
    required: true,
    trim: true,
  },
  addressStreet: {
    type: String,
    required: true,
    trim: true,
  },
  addressWard: {
    type: String,
    required: true,
    trim: true,
  },
  addressDistrict: {
    type: String,
    required: true,
    trim: true,
  },
  addressCity: {
    type: String,
    required: true,
    trim: true,
  },
  addressCountry: {
    type: String,
    required: true,
    trim: true,
  },
  addressLatitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  addressLongitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  addressIsDefault: {
    type: Boolean,
    default: false,
  },
  addressFor: {
    type: String,
    enum: ["customer", "shop", "admin"],
    default: "customer",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Address", addressSchema);
