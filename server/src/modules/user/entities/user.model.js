const mongoose = require("mongoose");

const userBaseSchema = new mongoose.Schema(
  {
    userFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    userLastName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    userAvatar: {
      type: String,
    },
    userMobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined,
    },
    userGender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
      required: false,
    },

    userDateOfBirth: {
      type: Date,
      required: false,
    },
    userStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserStatus",
      required: false,
    },

    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart",
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userBaseSchema);
