import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Public Comments & Internal Notes API Tests (TEST-008 & TEST-021)', () => {
  let requesterCookie: string;
  let requesterId: number;
  let staffCookie: string;
  let staffId: number;
  let ticketId: number;

  beforeAll(async () => {
    const testPasswordHash = bcrypt.hashSync('Password123!', 10);

    // Seed Requester
    const requester = await prisma.user.upsert({
      where: { email: 'req.comments@toktickit.com' },
      update: { isActive: true, role: 'REQUESTER', passwordHash: testPasswordHash },
      create: {
        name: 'Requester Comments Test',
        email: 'req.comments@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false
      }
    });
    requesterId = requester.id;

    // Seed Staff
    const staff = await prisma.user.upsert({
      where: { email: 'staff.notes@toktickit.com' },
      update: { isActive: true, role: 'IT_STAFF', passwordHash: testPasswordHash },
      create: {
        name: 'Staff Notes Test',
        email: 'staff.notes@toktickit.com',
        passwordHash: testPasswordHash,
        role: 'IT_STAFF',
        isActive: true,
        mustChangePassword: false
      }
    });
    staffId = staff.id;

    // Login Requester
    const reqRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'req.comments@toktickit.com', password: 'Password123!' });
    requesterCookie = reqRes.headers['set-cookie'][0];

    // Login Staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff.notes@toktickit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];

    // Seed Ticket
    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-CN-${Date.now()}`,
        requesterId: requesterId,
        categoryId: cat!.id,
        relatedSystemId: sys!.id,
        summary: 'Comments & Notes Test Ticket',
        description: 'Test description',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'NEW'
      }
    });
    ticketId = ticket.id;
  });

  afterAll(async () => {
    await prisma.publicComment.deleteMany({ where: { ticketId } });
    await prisma.internalNote.deleteMany({ where: { ticketId } });
    await prisma.ticket.deleteMany({ where: { id: ticketId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['req.comments@toktickit.com', 'staff.notes@toktickit.com'] } }
    });
    await prisma.$disconnect();
  });

  it('TEST-021 / AC-04: POST /api/tickets/:id/comments - should allow Requester and Staff to post public comments', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Cookie', requesterCookie)
      .send({ content: 'Hello from Requester' });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Hello from Requester');
    expect(res.body.author.id).toBe(requesterId);
  });

  it('TEST-021 / AC-04: GET /api/tickets/:id/comments - should fetch public comments', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}/comments`)
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('TEST-008 / AC-04: POST /api/staff/tickets/:id/notes - should allow Staff to create internal note', async () => {
    const res = await request(app)
      .post(`/api/staff/tickets/${ticketId}/notes`)
      .set('Cookie', staffCookie)
      .send({ content: 'Internal diagnosis details' });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Internal diagnosis details');
  });

  it('TEST-008 / AC-04: GET /api/staff/tickets/:id/notes - should block Requester from accessing internal notes with 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/staff/tickets/${ticketId}/notes`)
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('TEST-008 / AC-04: POST /api/staff/tickets/:id/notes - should block Requester from creating internal note with 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/staff/tickets/${ticketId}/notes`)
      .set('Cookie', requesterCookie)
      .send({ content: 'Unauthorized note attempt' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });
});
