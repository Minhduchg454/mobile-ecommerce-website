const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderStatusSchema = new mongoose.Schema(
  {
    orderStatusName: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Shipping",
        "Delivered",
        "Succeeded",
        "Cancelled",
      ],
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("OrderStatus", orderStatusSchema);
