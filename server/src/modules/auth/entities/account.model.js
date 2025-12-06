const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    accountName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    accountPassword: {
      type: String,
      required: function () {
        return !this.isOauth;
      },
    },
    accountType: {
      type: String,
      enum: ["password", "google"],
      default: "password",
      required: true,
      index: true,
    },
    isOauth: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
