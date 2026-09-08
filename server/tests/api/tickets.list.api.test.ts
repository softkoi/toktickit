import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: GET /api/tickets Ticket Listing & Ownership (TEST-012 / AC-07)', () => {
  let user1Id: number;
  let user2Id: number;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    const user1 = await prisma.requesterUser.upsert({
      where: { email: 'listUser1@example.com' },
      update: { isActive: true },
      create: { id: 911, name: 'List User 1', email: 'listUser1@example.com', isActive: true },
    });
    user1Id = user1.id;

    const user2 = await prisma.requesterUser.upsert({
      where: { email: 'listUser2@example.com' },
      update: { isActive: true },
      create: { id: 912, name: 'List User 2', email: 'listUser2@example.com', isActive: true },
    });
    user2Id = user2.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Listing Test Category' },
      update: { isActive: true },
      create: { id: 911, name: 'Listing Test Category', isActive: true },
    });
    categoryId = cat.id;

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Listing Test System' },
      update: { isActive: true },
      create: { id: 911, name: 'Listing Test System', isActive: true },
    });
    systemId = sys.id;

    // Clear old test tickets
    await prisma.ticket.deleteMany({ where: { requesterId: { in: [user1Id, user2Id] } } });

    // Create tickets for user 1
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-${new Date().getFullYear()}-911001`,
        requesterId: user1Id,
        categoryId,
        relatedSystemId: systemId,
        summary: 'User 1 Ticket Alpha',
        description: 'Description for User 1 Ticket Alpha',
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    });

    // Create tickets for user 2
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-${new Date().getFullYear()}-912001`,
        requesterId: user2Id,
        categoryId,
        relatedSystemId: systemId,
        summary: 'User 2 Ticket Beta',
        description: 'Description for User 2 Ticket Beta',
        requestedPriority: 'HIGH',
        currentStatus: 'NEW',
      },
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { requesterId: { in: [user1Id, user2Id] } } });
    await prisma.$disconnect();
  });

  it('should return only tickets belonging to user 1 when requested with user 1 X-Requester-Id Header (TEST-012)', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('X-Requester-Id', String(user1Id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('meta');
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].summary).toBe('User 1 Ticket Alpha');
  });

  it('should reject request when X-Requester-Id header is missing', async () => {
    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUESTER_HEADER');
  });
});
