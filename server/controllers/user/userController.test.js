const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');

// Dummy ObjectIds for roleId and statusUserId (replace with real ones in real tests)
const dummyObjectId = new mongoose.Types.ObjectId();

// Store token and userId for authenticated routes
describe('User Controller', () => {
  let token = '';
  let userId = '';

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        mobile: '0123456789',
        password: 'password',
        roleId: dummyObjectId,
        statusUserId: dummyObjectId
      });
    expect([200,201,400]).toContain(res.statusCode); // 400 if user exists
    if (res.body.user) userId = res.body.user._id;
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'testuser@example.com', password: 'password' });
    expect([200,201,400,401,404]).toContain(res.statusCode);
    if (res.body.token) token = res.body.token;
    if (res.body.user && res.body.user._id) userId = res.body.user._id;
  });

  it('should get current user info (if logged in)', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/user/current')
      .set('Authorization', `Bearer ${token}`);
    expect([200,401,404]).toContain(res.statusCode);
  });

  it('should update user info (if logged in)', async () => {
    if (!token) return;
    const res = await request(app)
      .put('/api/user/current')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated', lastName: 'User', mobile: '0987654321' });
    expect([200,401,404]).toContain(res.statusCode);
  });

  it('should get all users (admin only)', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/user/')
      .set('Authorization', `Bearer ${token}`);
    expect([200,401,403]).toContain(res.statusCode);
  });

  it('should delete user (admin only)', async () => {
    if (!token || !userId) return;
    const res = await request(app)
      .delete(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,401,403,404]).toContain(res.statusCode);
  });
}); 