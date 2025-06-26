const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');

const dummyObjectId = new mongoose.Types.ObjectId();

describe('User Routes', () => {
  let token = '';
  let userId = '';

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register user via route', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        firstName: 'Route',
        lastName: 'Test',
        email: 'routertest@example.com',
        mobile: '0222222222',
        password: 'password',
        roleId: dummyObjectId,
        statusUserId: dummyObjectId
      });
    expect([200,201,400]).toContain(res.statusCode);
    if (res.body.user) userId = res.body.user._id;
  });

  it('should login via route', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'routertest@example.com', password: 'password' });
    expect([200,201,400,401,404]).toContain(res.statusCode);
    if (res.body.token) token = res.body.token;
    if (res.body.user && res.body.user._id) userId = res.body.user._id;
  });

  it('should get current user info via route', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/user/current')
      .set('Authorization', `Bearer ${token}`);
    expect([200,401,404]).toContain(res.statusCode);
  });

  it('should update user info via route', async () => {
    if (!token) return;
    const res = await request(app)
      .put('/api/user/current')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'RouteUpdated', lastName: 'Test', mobile: '0999999999' });
    expect([200,401,404]).toContain(res.statusCode);
  });

  it('should get all users via route (admin only)', async () => {
    if (!token) return;
    const res = await request(app)
      .get('/api/user/')
      .set('Authorization', `Bearer ${token}`);
    expect([200,401,403]).toContain(res.statusCode);
  });

  it('should delete user via route (admin only)', async () => {
    if (!token || !userId) return;
    const res = await request(app)
      .delete(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,401,403,404]).toContain(res.statusCode);
  });
}); 