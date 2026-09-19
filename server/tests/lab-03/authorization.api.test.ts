import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('RBAC Authorization & Scoping API Tests (TEST-009 to TEST-014)', () => {
  let requesterCookie: string;
  let requesterId: number;
  let otherRequesterCookie: string;
  let otherRequesterId: number;
  let ticketId: number;

  beforeAll(async () => {
    const testPasswordHash = bcrypt.hashSync('Password123!', 10);

    // Seed Requester 1
    const req1 = await prisma.user.upsert({
      where: { email: 'auth.req1@toktickit.com' },
      update: { isActive: true, role: 'REQUESTER', passwordHash: testPasswordHash },
      create: {
        name: 'Auth Req 1',
        email: 'auth.req1@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false
      }
    });
    requesterId = req1.id;

    // Seed Requester 2
    const req2 = await prisma.user.upsert({
      where: { email: 'auth.req2@toktickit.com' },
      update: { isActive: true, role: 'REQUESTER', passwordHash: testPasswordHash },
      create: {
        name: 'Auth Req 2',
        email: 'auth.req2@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false
      }
    });
    otherRequesterId = req2.id;

    // Logins
    const res1 = await request(app).post('/api/auth/login').send({ email: 'auth.req1@toktickit.com', password: 'Password123!' });
    requesterCookie = res1.headers['set-cookie'][0];

    const res2 = await request(app).post('/api/auth/login').send({ email: 'auth.req2@toktickit.com', password: 'Password123!' });
    otherRequesterCookie = res2.headers['set-cookie'][0];

    // Seed ticket owned by Requester 1
    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-AUTH-${Date.now()}`,
        requesterId: requesterId,
        categoryId: cat!.id,
        relatedSystemId: sys!.id,
        summary: 'Auth Isolation Ticket',
        description: 'Testing ticket ownership isolation',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'NEW'
      }
    });
    ticketId = ticket.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { id: ticketId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['auth.req1@toktickit.com', 'auth.req2@toktickit.com'] } }
    });
    await prisma.$disconnect();
  });

  it('TEST-010 / AC-03: GET /api/tickets/:id - should isolate requester ticket access (reject other requester)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Cookie', otherRequesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('TEST-010 / AC-03: GET /api/tickets/:id - should allow ticket owner requester to access', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ticketId);
  });

  it('TEST-011 / AC-12: GET /api/admin/users - should reject non-Admin users with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('TEST-014 / AC-09: POST /api/tickets/:id/resolve-request - should update status when Requester requests resolution', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/resolve-request`)
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(200);
    expect(res.body.ticket.currentStatus).toBe('WAITING_FOR_REQUESTER');
  });
});
