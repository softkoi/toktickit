import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: GET /api/tickets Pagination & Metadata (TEST-015 / AC-10)', () => {
  let userId: number;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'paginationUser@example.com' },
      update: { isActive: true },
      create: { id: 916, name: 'Pagination User', email: 'paginationUser@example.com', isActive: true },
    });
    userId = user.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Pagination Test Cat' },
      update: { isActive: true },
      create: { id: 916, name: 'Pagination Test Cat', isActive: true },
    });
    categoryId = cat.id;

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Pagination Test Sys' },
      update: { isActive: true },
      create: { id: 916, name: 'Pagination Test Sys', isActive: true },
    });
    systemId = sys.id;

    await prisma.ticket.deleteMany({ where: { requesterId: userId } });

    // Create 15 tickets
    const ticketsData = Array.from({ length: 15 }, (_, i) => ({
      ticketNumber: `TKT-2026-916${String(i + 1).padStart(3, '0')}`,
      requesterId: userId,
      categoryId,
      relatedSystemId: systemId,
      summary: `Pagination Ticket ${i + 1}`,
      description: `Description ${i + 1}`,
      requestedPriority: 'LOW',
      currentStatus: 'NEW',
    }));

    await prisma.ticket.createMany({ data: ticketsData });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { requesterId: userId } });
    await prisma.$disconnect();
  });

  it('should return paginated items and accurate meta for page 2 with pageSize 10 (TEST-015)', async () => {
    const res = await request(app)
      .get('/api/tickets?page=2&pageSize=10')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(5);
    expect(res.body.data.meta).toEqual({
      page: 2,
      pageSize: 10,
      totalItems: 15,
      totalPages: 2,
    });
  });

  it('should return empty items when page exceeds totalPages (BR-08)', async () => {
    const res = await request(app)
      .get('/api/tickets?page=99&pageSize=10')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.meta).toEqual({
      page: 99,
      pageSize: 10,
      totalItems: 15,
      totalPages: 2,
    });
  });

  it('should return 400 INVALID_PAGE when page is invalid', async () => {
    const res = await request(app)
      .get('/api/tickets?page=-1')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_PAGE');
  });

  it('should return 400 INVALID_PAGE_SIZE when pageSize is not 10, 20, or 50', async () => {
    const res = await request(app)
      .get('/api/tickets?pageSize=15')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_PAGE_SIZE');
  });
});
