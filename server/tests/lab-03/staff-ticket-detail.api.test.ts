import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('IT Staff Ticket Detail & Operations API Tests (TEST-016 to TEST-020)', () => {
  let staffCookie: string;
  let staffUserId: number;
  let ticketId: number;

  beforeAll(async () => {
    const testPasswordHash = bcrypt.hashSync('Password123!', 10);

    // Seed IT Staff user
    const staff = await prisma.user.upsert({
      where: { email: 'staff.ops.test@toktickit.com' },
      update: { isActive: true, role: 'IT_STAFF', passwordHash: testPasswordHash },
      create: {
        name: 'Staff Ops Test',
        email: 'staff.ops.test@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'IT_STAFF',
        isActive: true,
        mustChangePassword: false
      }
    });
    staffUserId = staff.id;

    // Login staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff.ops.test@toktickit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];

    // Seed test ticket
    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-OPS-${Date.now()}`,
        requesterId: staff.id,
        categoryId: cat!.id,
        relatedSystemId: sys!.id,
        summary: 'Staff Operations Test Ticket',
        description: 'Test description for staff ops',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'NEW'
      }
    });
    ticketId = ticket.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { id: ticketId } });
    await prisma.user.deleteMany({ where: { email: 'staff.ops.test@toktickit.com' } });
    await prisma.$disconnect();
  });

  it('TEST-016 / AC-07: GET /api/staff/tickets/:id - should return complete ticket detail for IT Staff', async () => {
    const res = await request(app)
      .get(`/api/staff/tickets/${ticketId}`)
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ticket');
    expect(res.body.ticket.id).toBe(ticketId);
  });

  it('TEST-017 / AC-07: PATCH /api/staff/tickets/:id/claim - should claim ticket ownership', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/claim`)
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(res.body.ticket.ownerId).toBe(staffUserId);
  });

  it('TEST-017 / AC-07: PATCH /api/staff/tickets/:id/assign - should reassign ticket ownership', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/assign`)
      .set('Cookie', staffCookie)
      .send({ ownerId: staffUserId });

    expect(res.status).toBe(200);
    expect(res.body.ticket.ownerId).toBe(staffUserId);
  });

  it('TEST-018 / AC-08: PATCH /api/staff/tickets/:id/priority - should update IT priority', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/priority`)
      .set('Cookie', staffCookie)
      .send({ itPriority: 'HIGH' });

    expect(res.status).toBe(200);
    expect(res.body.ticket.itPriority).toBe('HIGH');
  });

  it('TEST-020 / AC-08: PATCH /api/staff/tickets/:id/status - should execute valid status transition', async () => {
    // NEW -> OPEN
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'OPEN' });

    expect(res.status).toBe(200);
    expect(res.body.ticket.currentStatus).toBe('OPEN');
  });

  it('TEST-020 / AC-08: PATCH /api/staff/tickets/:id/status - should reject invalid status transition with 400 Bad Request', async () => {
    // OPEN -> CLOSED is invalid (must go through IN_PROGRESS/RESOLVED first)
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });
});
