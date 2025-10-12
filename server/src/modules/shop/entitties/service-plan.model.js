// models/ServicePlan.js
const mongoose = require("mongoose");

const servicePlanSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceDescription: {
      type: String,
      trim: true,
    },
    serviceBillingCycle: {
      type: String, // ví dụ: 'monthly', 'yearly'
      required: true,
    },
    servicePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceColor: {
      type: String,
      default: "#FFFFFF", // mặc định màu trắng
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicePlan", servicePlanSchema);
