const mongoose = require("mongoose");

const userStatusSchema = new mongoose.Schema({
  userStatusName: {
    type: String,
    required: true,
    enum: ["active", "block"],
  },
});

module.exports = mongoose.model("UserStatus", userStatusSchema);
