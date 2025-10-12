// models/Brand.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const themeSchema = new Schema(
  {
    themeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    themeSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    themeImage: {
      type: String,
      required: true,
    },
    themeColor: {
      type: String,
      default: "#ffffff",
    },
    themeDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // có sẵn createdAt và updatedAt
  }
);

module.exports = model("Theme", themeSchema);
