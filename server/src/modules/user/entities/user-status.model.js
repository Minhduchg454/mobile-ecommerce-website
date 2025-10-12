const mongoose = require("mongoose");

const userStatusSchema = new mongoose.Schema({
  userStatusName: { type: String, required: true },
});

module.exports = mongoose.model("UserStatus", userStatusSchema);
