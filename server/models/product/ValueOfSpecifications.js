// models/ValueOfSpecifications.js
const mongoose = require("mongoose");

const valueOfSpecificationsSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    specificationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specifications",
      required: true,
    },
    // Chỉ sử dụng một trong hai field dưới đây:
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productVariationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo chỉ có productId hoặc productVariationId, không phải cả hai hoặc cả hai đều null
valueOfSpecificationsSchema.pre("validate", function (next) {
  if (!this.productId && !this.productVariationId) {
    next(new Error("Cần có productId hoặc productVariationId."));
  } else if (this.productId && this.productVariationId) {
    next(
      new Error(
        "Chỉ được có productId hoặc productVariationId, không được cả hai."
      )
    );
  } else {
    next();
  }
});

module.exports = mongoose.model(
  "ValueOfSpecifications",
  valueOfSpecificationsSchema
);
