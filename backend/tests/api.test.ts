import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db/prisma';

const app = createApp();

const SEED_EMAIL = 'demo@smartbuilding.test';
const SEED_PASSWORD = 'demo1234';

let token: string;
let apartmentId: number;
let deviceId: number;
let createdScheduleId: number;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: SEED_EMAIL, password: SEED_PASSWORD });
  token = loginRes.body.token;

  const apt = await prisma.apartment.findFirst({ where: { owner: { email: SEED_EMAIL } } });
  if (!apt) throw new Error('Seed apartment not found — run npm run seed first');
  apartmentId = apt.id;

  const device = await prisma.device.findFirst({ where: { room: { apartmentId } } });
  if (!device) throw new Error('Seed device not found — run npm run seed first');
  deviceId = device.id;
});

afterAll(async () => {
  await prisma.schedule.deleteMany({ where: { device: { room: { apartmentId } }, createdAt: { gte: new Date(Date.now() - 60_000) } } });
  await prisma.$disconnect();
});

describe('GET /api/devices', () => {
  it('returns list of devices for the apartment', async () => {
    const res = await request(app)
      .get(`/api/devices?apartmentId=${apartmentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('status');
  });

  it('requires authentication', async () => {
    const res = await request(app).get(`/api/devices?apartmentId=${apartmentId}`);
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/devices/:id/status', () => {
  it('toggles device status and returns updated device', async () => {
    const current = await prisma.device.findUnique({ where: { id: deviceId } });
    const newStatus = !current!.status;

    const res = await request(app)
      .patch(`/api/devices/${deviceId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: newStatus });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(newStatus);
    expect(res.body.id).toBe(deviceId);
  });

  it('returns 400 when status field is missing', async () => {
    const res = await request(app)
      .patch(`/api/devices/${deviceId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('Schedule API', () => {
  it('POST /api/schedules creates a new schedule', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deviceId,
        startTime: '08:00',
        endTime: '22:00',
        days: ['MON', 'WED', 'FRI'],
      });

    expect(res.status).toBe(201);
    expect(res.body.deviceId).toBe(deviceId);
    expect(res.body.startTime).toBe('08:00');
    expect(res.body.endTime).toBe('22:00');
    expect(Array.isArray(res.body.days)).toBe(true);
    expect(res.body.days).toContain('MON');
    createdScheduleId = res.body.id;
  });

  it('GET /api/schedules/device/:id returns device schedules', async () => {
    const res = await request(app)
      .get(`/api/schedules/device/${deviceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const created = res.body.find((s: { id: number }) => s.id === createdScheduleId);
    expect(created).toBeDefined();
  });

  it('PATCH /api/schedules/:id updates a schedule', async () => {
    const res = await request(app)
      .patch(`/api/schedules/${createdScheduleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ startTime: '09:00', days: ['MON', 'TUE', 'WED', 'THU', 'FRI'] });

    expect(res.status).toBe(200);
    expect(res.body.startTime).toBe('09:00');
    expect(res.body.days).toContain('THU');
  });

  it('DELETE /api/schedules/:id removes the schedule', async () => {
    const res = await request(app)
      .delete(`/api/schedules/${createdScheduleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);

    const check = await prisma.schedule.findUnique({ where: { id: createdScheduleId } });
    expect(check).toBeNull();
  });
});

describe('GET /api/dashboard', () => {
  it('returns totals, rooms, and daily chart for the apartment', async () => {
    const res = await request(app)
      .get(`/api/dashboard/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totals');
    expect(res.body.totals).toHaveProperty('day');
    expect(res.body.totals).toHaveProperty('week');
    expect(res.body.totals).toHaveProperty('month');
    expect(Array.isArray(res.body.rooms)).toBe(true);
    expect(Array.isArray(res.body.dailyChart)).toBe(true);
  });
});

describe('GET /api/buildings/:id/overview', () => {
  it('returns building overview with per-apartment energy totals', async () => {
    const building = await prisma.building.findFirst();
    if (!building) throw new Error('No building in seed data');

    const res = await request(app)
      .get(`/api/buildings/${building.id}/overview`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('building');
    expect(res.body).toHaveProperty('apartments');
    expect(res.body).toHaveProperty('totalTodayKwh');
    expect(res.body).toHaveProperty('totalMonthKwh');
    expect(Array.isArray(res.body.apartments)).toBe(true);
  });
});

describe('PATCH /api/apartments/:id/mode', () => {
  it('sets apartment mode to HOME', async () => {
    const res = await request(app)
      .patch(`/api/apartments/${apartmentId}/mode`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'HOME' });

    expect(res.status).toBe(200);
    expect(res.body.activeMode).toBe('HOME');
  });

  it('sets apartment mode back to NONE', async () => {
    const res = await request(app)
      .patch(`/api/apartments/${apartmentId}/mode`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'NONE' });

    expect(res.status).toBe(200);
    expect(res.body.activeMode).toBe('NONE');
  });

  it('rejects invalid mode with 400', async () => {
    const res = await request(app)
      .patch(`/api/apartments/${apartmentId}/mode`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'VACATION' });

    expect(res.status).toBe(400);
  });
});
