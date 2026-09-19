import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('IT Staff Queue API Tests (TEST-015 / AC-06)', () => {
  let staffCookie: string;
  let requesterCookie: string;

  beforeAll(async () => {
    const testPasswordHash = bcrypt.hashSync('Password123!', 10);

    // Seed staff user
    const staff = await prisma.user.upsert({
      where: { email: 'staff.queue.test@toktickit.com' },
      update: { isActive: true, role: 'IT_STAFF', passwordHash: testPasswordHash },
      create: {
        name: 'Staff Queue Test',
        email: 'staff.queue.test@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'IT_STAFF',
        isActive: true,
        mustChangePassword: false
      }
    });

    // Seed requester user
    const requester = await prisma.user.upsert({
      where: { email: 'req.queue.test@toktickit.com' },
      update: { isActive: true, role: 'REQUESTER', passwordHash: testPasswordHash },
      create: {
        name: 'Req Queue Test',
        email: 'req.queue.test@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false
      }
    });

    // Login staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff.queue.test@toktickit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];

    // Login requester
    const reqRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'req.queue.test@toktickit.com', password: 'Password123!' });
    requesterCookie = reqRes.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['staff.queue.test@toktickit.com', 'req.queue.test@toktickit.com'] } }
    });
    await prisma.$disconnect();
  });

  it('TEST-015 / AC-06: GET /api/staff/tickets - should return paginated tickets for IT Staff', async () => {
    const res = await request(app)
      .get('/api/staff/tickets?page=1&pageSize=10')
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('TEST-015 / AC-06: GET /api/staff/tickets - should filter by status and priority', async () => {
    const res = await request(app)
      .get('/api/staff/tickets?status=NEW&priority=MEDIUM')
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('TEST-009 / AC-12: GET /api/staff/tickets - should block Requesters with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/staff/tickets')
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });
});
