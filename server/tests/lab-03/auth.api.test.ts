import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../../src/app';

const prisma = new PrismaClient();

describe('Authentication API Tests (Lab 03)', () => {
  const validPassword = 'Password123!';
  const hashedPassword = bcrypt.hashSync(validPassword, 10);

  const activeUserEmail = 'auth.active@toktickit.com';
  const inactiveUserEmail = 'auth.inactive@toktickit.com';
  const firstLoginUserEmail = 'auth.firstlogin@toktickit.com';

  beforeAll(async () => {
    // Seed test users
    await prisma.user.upsert({
      where: { email: activeUserEmail },
      update: { passwordHash: hashedPassword, isActive: true, mustChangePassword: false },
      create: {
        email: activeUserEmail,
        name: 'Active Auth Test User',
        passwordHash: hashedPassword,
        role: 'IT_STAFF',
        isActive: true,
        mustChangePassword: false
      }
    });

    await prisma.user.upsert({
      where: { email: inactiveUserEmail },
      update: { passwordHash: hashedPassword, isActive: false, mustChangePassword: true },
      create: {
        email: inactiveUserEmail,
        name: 'Inactive Auth Test User',
        passwordHash: hashedPassword,
        role: 'REQUESTER',
        isActive: false,
        mustChangePassword: true
      }
    });

    await prisma.user.upsert({
      where: { email: firstLoginUserEmail },
      update: { passwordHash: hashedPassword, isActive: true, mustChangePassword: true },
      create: {
        email: firstLoginUserEmail,
        name: 'First Login Test User',
        passwordHash: hashedPassword,
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: true
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [activeUserEmail, inactiveUserEmail, firstLoginUserEmail]
        }
      }
    });
    await prisma.$disconnect();
  });

  it('TEST-001: should login successfully with valid email and password (200 OK)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: activeUserEmail,
        password: validPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(activeUserEmail);
    expect(res.body.user.role).toBe('IT_STAFF');
    expect(res.body.user.isActive).toBe(true);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('toktickit_session=');
  });

  it('TEST-002: should return 401 Unauthorized for invalid email or password', async () => {
    const resInvalidPassword = await request(app)
      .post('/api/auth/login')
      .send({
        email: activeUserEmail,
        password: 'WrongPassword123!'
      });

    expect(resInvalidPassword.status).toBe(401);
    expect(resInvalidPassword.body.error).toBeDefined();
    expect(resInvalidPassword.body.error.code).toBe('INVALID_CREDENTIALS');

    const resInvalidEmail = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent.user@toktickit.com',
        password: validPassword
      });

    expect(resInvalidEmail.status).toBe(401);
    expect(resInvalidEmail.body.error.code).toBe('INVALID_CREDENTIALS');

    const resEmptyBody = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(resEmptyBody.status).toBe(401);
    expect(resEmptyBody.body.error).toBeDefined();
    expect(resEmptyBody.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('TEST-003: should return 401 Unauthorized when attempting to login with an inactive account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: inactiveUserEmail,
        password: validPassword
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toMatch(/deactivated|inactive/i);
  });

  it('TEST-005: should reject password change if new password fails policy rules (400 Bad Request)', async () => {
    // 1. Login first to get session cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: firstLoginUserEmail,
        password: validPassword
      });

    const sessionCookie = loginRes.headers['set-cookie'];

    // 2. Attempt password change with weak password
    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', sessionCookie)
      .send({
        currentPassword: validPassword,
        newPassword: 'weak'
      });

    expect(changeRes.status).toBe(400);
    expect(changeRes.body.error).toBeDefined();
    expect(changeRes.body.error.code).toBe('INVALID_INPUT');
  });

  it('TEST-007: should logout successfully and invalidate access to protected endpoints', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: activeUserEmail,
        password: validPassword
      });

    const sessionCookie = loginRes.headers['set-cookie'];

    // 2. Verify /api/auth/me works with session
    const meResBefore = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);

    expect(meResBefore.status).toBe(200);
    expect(meResBefore.body.user.email).toBe(activeUserEmail);

    // 3. Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toContain('Logged out');

    // 4. Verify calling protected endpoint after logout fails or with expired cookie
    const meResAfter = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['toktickit_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);

    expect(meResAfter.status).toBe(401);
  });
});
