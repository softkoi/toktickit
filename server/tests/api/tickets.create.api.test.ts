import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Integration Test: POST /api/tickets Success Flow (TEST-003 / AC-02)', () => {
  let requesterId = 1;
  let categoryId = 1;
  let relatedSystemId = 1;

  beforeAll(async () => {
    const reqUser = await prisma.requesterUser.upsert({
      where: { email: 'ticket.creator@example.com' },
      update: { isActive: true },
      create: { name: 'Ticket Creator', email: 'ticket.creator@example.com', isActive: true },
    });
    requesterId = reqUser.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Software & OS' },
      update: { isActive: true },
      create: { name: 'Software & OS', isActive: true },
    });
    categoryId = cat.id;

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Email Client' },
      update: { isActive: true },
      create: { name: 'Email Client', isActive: true },
    });
    relatedSystemId = sys.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/tickets - should create a ticket successfully with 201 Created', async () => {
    const payload = {
      categoryId,
      relatedSystemId,
      requestedPriority: 'HIGH',
      summary: 'Cannot connect to email server',
      description: 'Outlook fails to sync emails since morning update. Error code 0x80040115.',
    };

    const res = await request(app)
      .post('/api/tickets')
      .set('X-Requester-Id', String(requesterId))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(res.body.data.currentStatus).toBe('NEW');
    expect(res.body.data.summary).toBe(payload.summary);
    expect(res.body.data.description).toBe(payload.description);
    expect(res.body.data.requestedPriority).toBe('HIGH');
    expect(res.body.data.requesterId).toBe(requesterId);
  });
});
