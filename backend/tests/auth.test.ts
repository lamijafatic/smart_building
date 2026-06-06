import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db/prisma';

const app = createApp();

const SEED_EMAIL = 'demo@smartbuilding.test';
const SEED_PASSWORD = 'demo1234';
const REG_EMAIL = `test_register_${Date.now()}@test.com`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: REG_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns token + user object', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: REG_EMAIL, password: 'securepass', name: 'Test Reg' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(REG_EMAIL);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: REG_EMAIL, password: 'securepass', name: 'Test Reg' });

    expect(res.status).toBe(409);
  });

  it('rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: '123', name: 'X' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a JWT token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: SEED_EMAIL, password: SEED_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(SEED_EMAIL);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: SEED_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'test1234' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: SEED_EMAIL });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: SEED_EMAIL, password: SEED_PASSWORD });
    token = res.body.token;
  });

  it('returns current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(SEED_EMAIL);
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.valid.jwt');
    expect(res.status).toBe(401);
  });
});
