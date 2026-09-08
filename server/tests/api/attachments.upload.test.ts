import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../src/app';
import { generateTicketNumber } from '../../src/utils/ticket-number.generator';

const prisma = new PrismaClient();
const request = supertest(app);

describe('API Test: POST /api/tickets/:id/attachments (TEST-007 / AC-04)', () => {
  let requesterId: number;
  let ticketId: number;

  beforeAll(async () => {
    // Seed test requester
    const requester = await prisma.requesterUser.upsert({
      where: { email: 'uploadTestUser@example.com' },
      update: { isActive: true },
      create: { id: 997, name: 'Upload Test User', email: 'uploadTestUser@example.com', isActive: true },
    });
    requesterId = requester.id;

    const category = await prisma.category.upsert({
      where: { name: 'Upload Test Category' },
      update: { isActive: true },
      create: { id: 997, name: 'Upload Test Category', isActive: true },
    });

    const system = await prisma.relatedSystem.upsert({
      where: { name: 'Upload Test System' },
      update: { isActive: true },
      create: { id: 997, name: 'Upload Test System', isActive: true },
    });

    const ticketNumber = `TKT-${new Date().getFullYear()}-000101`;
    await prisma.attachment.deleteMany({ where: { ticket: { ticketNumber } } });
    await prisma.ticket.deleteMany({ where: { ticketNumber } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: requester.id,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: 'Attachment Upload Test Ticket',
        description: 'Testing valid file uploads',
        requestedPriority: 'MEDIUM',
        currentStatus: 'NEW',
      },
    });

    ticketId = ticket.id;
  });

  afterAll(async () => {
    await prisma.attachment.deleteMany({ where: { ticketId } });
    await prisma.ticket.delete({ where: { id: ticketId } });
    await prisma.$disconnect();
  });

  it('should upload valid JPEG/PNG/PDF file successfully and return 201 Created (TEST-007)', async () => {
    const dummyBuffer = Buffer.from('fake image content');

    const res = await request
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', String(requesterId))
      .attach('file', dummyBuffer, {
        filename: 'sample_screenshot.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.ticketId).toBe(ticketId);
    expect(res.body.data.fileName).toBe('sample_screenshot.png');
    expect(res.body.data.mimeType).toBe('image/png');
    expect(res.body.data.isRemoved).toBe(false);
  });
});
