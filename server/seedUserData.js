const mongoose = require('mongoose');
const Role = require('./models/user/Role');
const StatusUser = require('./models/user/StatusUser');

// Kết nối tới MongoDB local, database tên 'ct250'
const uri = 'mongodb://localhost:27017/ct250';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    // Tạo role mẫu
    const roles = await Role.insertMany([
      { roleName: 'admin' },
      { roleName: 'customer' }
    ]);
    // Tạo status user mẫu
    const statuses = await StatusUser.insertMany([
      { statusUserName: 'active' },
      { statusUserName: 'inactive' }
    ]);
    console.log('Roles:', roles);
    console.log('StatusUsers:', statuses);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  }); 