import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db/prisma';
import bcrypt from 'bcrypt';

const app = createApp();

beforeAll(async () => {
  await prisma.energyData.deleteMany();
  await prisma.device.deleteMany();
  await prisma.room.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.building.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('test1234', 10);
  await prisma.user.create({
    data: { email: 'test@example.com', passwordHash, name: 'Test', role: 'RESIDENT' },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'test1234' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the user when authenticated', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'test1234' });
    const token = login.body.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });
});
