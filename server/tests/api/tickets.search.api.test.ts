import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: GET /api/tickets Keyword Search (TEST-013 / AC-08)', () => {
  let userId: number;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'searchUser@example.com' },
      update: { isActive: true },
      create: { id: 913, name: 'Search Test User', email: 'searchUser@example.com', isActive: true },
    });
    userId = user.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Search Test Category' },
      update: { isActive: true },
      create: { id: 913, name: 'Search Test Category', isActive: true },
    });
    categoryId = cat.id;

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Search Test System' },
      update: { isActive: true },
      create: { id: 913, name: 'Search Test System', isActive: true },
    });
    systemId = sys.id;

    await prisma.ticket.deleteMany({ where: { requesterId: userId } });

    await prisma.ticket.createMany({
      data: [
        {
          ticketNumber: 'TKT-2026-913001',
          requesterId: userId,
          categoryId,
          relatedSystemId: systemId,
          summary: 'Laptop battery drains fast',
          description: 'Battery health degraded',
          requestedPriority: 'MEDIUM',
          currentStatus: 'NEW',
        },
        {
          ticketNumber: 'TKT-2026-913002',
          requesterId: userId,
          categoryId,
          relatedSystemId: systemId,
          summary: 'VPN connection error',
          description: 'Cannot reach internal servers',
          requestedPriority: 'HIGH',
          currentStatus: 'NEW',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { requesterId: userId } });
    await prisma.$disconnect();
  });

  it('should search tickets matching summary keyword case-insensitively (TEST-013)', async () => {
    const res = await request(app)
      .get('/api/tickets?search=BATTERY')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].summary).toBe('Laptop battery drains fast');
  });

  it('should search tickets matching ticket number', async () => {
    const res = await request(app)
      .get('/api/tickets?search=913002')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].ticketNumber).toBe('TKT-2026-913002');
  });
});
