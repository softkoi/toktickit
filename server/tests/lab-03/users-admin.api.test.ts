import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Administrator User Management API Tests (TEST-023 to TEST-029)', () => {
  let adminCookie: string;
  let adminUserId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Ensure test admin exists
    let admin = await prisma.user.findUnique({
      where: { email: 'admin.test@toktickit.com' }
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          name: 'Admin Test User',
          email: 'admin.test@toktickit.com',
          passwordHash: bcrypt.hashSync('Password123!', 10),
          role: 'ADMINISTRATOR' as any,
          isActive: true,
          mustChangePassword: false
        }
      });
    }
    adminUserId = admin.id;

    // Login as admin to obtain session cookie
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@toktickit.com', password: 'Password123!' });

    const cookies = res.headers['set-cookie'];
    adminCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin.test@toktickit.com', 'new.staff@toktickit.com', 'dup.email@toktickit.com']
        }
      }
    });
    await prisma.$disconnect();
  });

  it('TEST-023 / AC-10: GET /api/admin/users - should list users with search and filter', async () => {
    const res = await request(app)
      .get('/api/admin/users?search=Admin&role=ADMINISTRATOR')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body).toHaveProperty('pagination');
  });

  it('TEST-024 / AC-10: POST /api/admin/users - should create a new user account', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'New Staff User',
        email: 'new.staff@toktickit.com',
        role: 'IT_STAFF',
        isActive: true,
        initialPassword: 'Password123!',
        mustChangePassword: true
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('new.staff@toktickit.com');
    expect(res.body.user.role).toBe('IT_STAFF');
    expect(res.body.user.mustChangePassword).toBe(true);
    testUserId = res.body.user.id;
  });

  it('TEST-025 / AC-12: POST /api/admin/users - should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'Duplicate Staff',
        email: 'new.staff@toktickit.com',
        role: 'IT_STAFF',
        initialPassword: 'Password123!'
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('TEST-026 / AC-10: PATCH /api/admin/users/:id - should update existing user details', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${testUserId}`)
      .set('Cookie', adminCookie)
      .send({
        name: 'Updated Staff Name',
        role: 'IT_STAFF',
        isActive: true
      });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Staff Name');
  });

  it('TEST-027 / AC-10: POST /api/admin/users/:id/reset-password - should reset user initial password', async () => {
    const res = await request(app)
      .post(`/api/admin/users/${testUserId}/reset-password`)
      .set('Cookie', adminCookie)
      .send({
        newInitialPassword: 'NewPassword456!'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.mustChangePassword).toBe(true);
  });

  it('TEST-028 / AC-11 / BR-13: PATCH /api/admin/users/:id - should block self-deactivation attempt with 400', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUserId}`)
      .set('Cookie', adminCookie)
      .send({
        isActive: false
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('TEST-029 / AC-11 / BR-14: PATCH /api/admin/users/:id - should block deactivating the last active administrator', async () => {
    // Temporarily deactivate all other active admins except adminUserId
    const otherActiveAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMINISTRATOR',
        isActive: true,
        id: { not: adminUserId }
      }
    });

    const otherIds = otherActiveAdmins.map((u) => u.id);
    if (otherIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: otherIds } },
        data: { isActive: false }
      });
    }

    try {
      // Now adminUserId is guaranteed to be the ONLY active admin
      const res = await request(app)
        .patch(`/api/admin/users/${adminUserId}`)
        .set('Cookie', adminCookie)
        .send({ role: 'REQUESTER' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    } finally {
      // Restore previously active admins
      if (otherIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: otherIds } },
          data: { isActive: true }
        });
      }
    }
  });
});
