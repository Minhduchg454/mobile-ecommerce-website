// server/seedRolesAndStatus.js
// Script seed role 'customer' và status 'active' vào database nếu chưa có
const mongoose = require("mongoose");
require("dotenv").config();
const Role = require("./models/user/Role");
const StatusUser = require("./models/user/StatusUser");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/cuahangdientu";

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Seed role 'customer'
  let customerRole = await Role.findOne({ roleName: "customer" });
  if (!customerRole) {
    customerRole = await Role.create({ roleName: "customer" });
  } else {
    console.log("Role customer đã tồn tại:", customerRole._id);
  }

  // Seed status 'active'
  let activeStatus = await StatusUser.findOne({ statusName: "active" });
  if (!activeStatus) {
    activeStatus = await StatusUser.create({ statusName: "active" });
    console.log("Đã thêm status active:", activeStatus._id);
  } else {
    console.log("Status active đã tồn tại:", activeStatus._id);
  }

  await mongoose.disconnect();
}

seed().then(() => process.exit(0));
