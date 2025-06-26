const mongoose = require('mongoose');
const User = require('./User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cuahangdientu_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create & save user successfully', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'modeltest@example.com',
      mobile: '0111111111',
      roleId: new mongoose.Types.ObjectId(),
      statusUserId: new mongoose.Types.ObjectId(),
      userName: new mongoose.Types.ObjectId()
    };
    const user = new User(userData);
    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
  });

  it('should fail if required fields are missing', async () => {
    const user = new User({});
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors).toBeDefined();
  });
}); 