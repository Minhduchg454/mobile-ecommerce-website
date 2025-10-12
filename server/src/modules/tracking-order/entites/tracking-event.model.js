const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của Order
      ref: "Order", // Tên model mà chúng ta đang tham chiếu
      required: true,
    },
    trackingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrackingOrder",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrackingEvent", trackingEventSchema);
