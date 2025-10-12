const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    categorySlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    categoryThumb: {
      type: String,
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Category", categorySchema);
