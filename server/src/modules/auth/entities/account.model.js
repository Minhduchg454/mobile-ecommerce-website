const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

accountSchema.index(
  { accountName: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model("Account", accountSchema);
