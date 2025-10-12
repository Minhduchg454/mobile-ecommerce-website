const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var categoryShopSchema = new mongoose.Schema(
  {
    csName: {
      type: String,
      required: true,
    },
    csSlug: {
      type: String,
      required: true,
      lowercase: true,
    },
    csThumb: {
      type: String,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

categoryShopSchema.index({ shopId: 1, csName: 1 }, { unique: true });
//Export the model
module.exports = mongoose.model("CategoryShop", categoryShopSchema);
