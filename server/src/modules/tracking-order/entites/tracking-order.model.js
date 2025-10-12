const mongoose = require("mongoose");

const trackingOrderSchema = new mongoose.Schema(
  {
    trackingLocation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // có createdAt, updatedAt
);

module.exports = mongoose.model("TrackingOrder", trackingOrderSchema);
