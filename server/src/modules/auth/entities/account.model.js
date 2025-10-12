const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    accountName: {
      // phone/email (đăng nhập password)
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    accountPassword: {
      // chỉ dùng khi password
      type: String,
      required: function () {
        return !this.isOauth;
      },
    },

    accountType: {
      // "password" | "oauth"
      type: String,
      enum: ["password", "google"],
      default: "password",
      required: true,
      index: true,
    },

    isOauth: {
      // cờ đơn giản cho oauth
      type: Boolean,
      default: false,
      index: true,
    },

    userId: {
      // nên có: 1 User : N Account
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
