// models/WishList.js
const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    pvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WishList", wishListSchema);
