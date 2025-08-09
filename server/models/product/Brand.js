// models/Brand.js
const mongoose = require("mongoose");
const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true, // Tên thương hiệu thường là duy nhất
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

brandSchema.set("toJSON", {
  versionKey: false,
});

module.exports = mongoose.model("Brand", brandSchema);
