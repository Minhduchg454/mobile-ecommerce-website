const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    enum: ["admin", "customer", "shop"],
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
