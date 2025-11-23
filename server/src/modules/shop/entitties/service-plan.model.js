// models/ServicePlan.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const servicePlanSchema = new Schema(
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
      type: String,
      required: true,
      enum: ["monthly", "yearly"],
    },
    servicePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceColor: {
      type: String,
      default: "#FFFFFF",
    },
    serviceSubscriberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceFeatures: {
      type: [
        {
          key: {
            type: String,
            required: true,
            trim: true,
            enum: [
              "MAX_PRODUCTS",
              "SUPPORT",
              "ANALYTICS",
              "ADS_BOOST",
              "MULTI_CATEGORY",
              "DISCOUNT",
            ],
          },
          label: {
            type: String,
            required: true,
            trim: true,
          },
          value: {
            type: String,
            required: true,
            trim: true,
          },
          type: {
            type: String,
            enum: ["string", "number", "boolean"],
            default: "string",
          },
          unit: {
            type: String,
          },
        },
      ],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

servicePlanSchema.index(
  { serviceName: 1, serviceBillingCycle: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

module.exports = model("ServicePlan", servicePlanSchema);
