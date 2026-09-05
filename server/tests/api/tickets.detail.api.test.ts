import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: GET /api/tickets/:id Ticket Detail View (TEST-017 / AC-11)', () => {
  let userId: number;
  let otherUserId: number;
  let ticketId: number;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'detailUser@example.com' },
      update: { isActive: true },
      create: { id: 917, name: 'Detail User', email: 'detailUser@example.com', isActive: true },
    });
    userId = user.id;

    const otherUser = await prisma.requesterUser.upsert({
      where: { email: 'otherDetailUser@example.com' },
      update: { isActive: true },
      create: { id: 918, name: 'Other Detail User', email: 'otherDetailUser@example.com', isActive: true },
    });
    otherUserId = otherUser.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Detail Test Cat' },
      update: { isActive: true },
      create: { id: 917, name: 'Detail Test Cat', isActive: true },
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Detail Test Sys' },
      update: { isActive: true },
      create: { id: 917, name: 'Detail Test Sys', isActive: true },
    });

    await prisma.ticket.deleteMany({ where: { requesterId: { in: [userId, otherUserId] } } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-2026-917001',
        requesterId: userId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Detail Test Ticket',
        description: 'Detail Test Description',
        requestedPriority: 'MEDIUM',
        currentStatus: 'NEW',
      },
    });
    ticketId = ticket.id;

    await prisma.attachment.create({
      data: {
        ticketId,
        fileName: 'detail_att.png',
        mimeType: 'image/png',
        sizeBytes: 1024,
        filePath: '/uploads/detail_att.png',
        isRemoved: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.attachment.deleteMany({ where: { ticketId } });
    await prisma.ticket.deleteMany({ where: { requesterId: { in: [userId, otherUserId] } } });
    await prisma.$disconnect();
  });

  it('should return 200 OK with full ticket details and attachments array (TEST-017)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(ticketId);
    expect(res.body.data.summary).toBe('Detail Test Ticket');
    expect(res.body.data.attachments.length).toBe(1);
  });

  it('should return 404 Not Found if ticket does not exist', async () => {
    const res = await request(app)
      .get('/api/tickets/999999')
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 403 Forbidden when trying to access another requester ticket (TEST-024 / BR-09)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('X-Requester-Id', String(otherUserId));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
