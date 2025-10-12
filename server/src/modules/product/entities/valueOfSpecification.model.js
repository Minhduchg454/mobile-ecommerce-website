// models/ValueOfSpecifications.js
const mongoose = require("mongoose");

const valueOfSpecificationSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    typeSpecificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeSpecification",
      required: true,
    },
    // Chỉ sử dụng một trong hai field dưới đây:
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    pvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ValueOfSpecification",
  valueOfSpecificationSchema
);
