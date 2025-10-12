// models/SpecificProduct.js
const mongoose = require("mongoose");

const productThemeSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductTheme", productThemeSchema);
