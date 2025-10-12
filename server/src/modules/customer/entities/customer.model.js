const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart",
      required: true,
    },
  },
  { _id: false }
);

module.exports = mongoose.model("Customer", customerSchema, "customers");
