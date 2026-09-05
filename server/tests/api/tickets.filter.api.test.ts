import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: GET /api/tickets Multi-condition Filtering (TEST-014 / AC-09)', () => {
  let userId: number;
  let category1Id: number;
  let category2Id: number;
  let systemId: number;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'filterUser@example.com' },
      update: { isActive: true },
      create: { id: 914, name: 'Filter Test User', email: 'filterUser@example.com', isActive: true },
    });
    userId = user.id;

    const cat1 = await prisma.category.upsert({
      where: { name: 'Filter Cat 1' },
      update: { isActive: true },
      create: { id: 914, name: 'Filter Cat 1', isActive: true },
    });
    category1Id = cat1.id;

    const cat2 = await prisma.category.upsert({
      where: { name: 'Filter Cat 2' },
      update: { isActive: true },
      create: { id: 915, name: 'Filter Cat 2', isActive: true },
    });
    category2Id = cat2.id;

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Filter Test System' },
      update: { isActive: true },
      create: { id: 914, name: 'Filter Test System', isActive: true },
    });
    systemId = sys.id;

    await prisma.ticket.deleteMany({ where: { requesterId: userId } });

    await prisma.ticket.createMany({
      data: [
        {
          ticketNumber: 'TKT-2026-914001',
          requesterId: userId,
          categoryId: category1Id,
          relatedSystemId: systemId,
          summary: 'Ticket 1',
          description: 'Desc 1',
          requestedPriority: 'HIGH',
          currentStatus: 'NEW',
        },
        {
          ticketNumber: 'TKT-2026-914002',
          requesterId: userId,
          categoryId: category2Id,
          relatedSystemId: systemId,
          summary: 'Ticket 2',
          description: 'Desc 2',
          requestedPriority: 'LOW',
          currentStatus: 'NEW',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { requesterId: userId } });
    await prisma.$disconnect();
  });

  it('should filter tickets with combined conditions AND logic (TEST-014)', async () => {
    const res = await request(app)
      .get(`/api/tickets?category=${category1Id}&requestedPriority=HIGH&status=NEW`)
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].ticketNumber).toBe('TKT-2026-914001');
  });
});
