import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../src/app';
import { generateTicketNumber } from '../../src/utils/ticket-number.generator';

const prisma = new PrismaClient();
const request = supertest(app);

describe('API Test: Attachment Quota Enforcement (TEST-010 / AC-06)', () => {
  let requesterId: number;
  let ticketId: number;

  beforeAll(async () => {
    const requester = await prisma.requesterUser.upsert({
      where: { email: 'quotaUser@example.com' },
      update: { isActive: true },
      create: { id: 994, name: 'Quota Test User', email: 'quotaUser@example.com', isActive: true },
    });
    requesterId = requester.id;

    const category = await prisma.category.upsert({
      where: { name: 'Quota Category' },
      update: { isActive: true },
      create: { id: 994, name: 'Quota Category', isActive: true },
    });

    const system = await prisma.relatedSystem.upsert({
      where: { name: 'Quota System' },
      update: { isActive: true },
      create: { id: 994, name: 'Quota System', isActive: true },
    });

    const ticketNumber = `TKT-${new Date().getFullYear()}-000103`;
    await prisma.attachment.deleteMany({ where: { ticket: { ticketNumber } } });
    await prisma.ticket.deleteMany({ where: { ticketNumber } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: requester.id,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: 'Quota Test Ticket',
        description: 'Testing max 5 active attachments limit',
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    });

    ticketId = ticket.id;

    // Pre-populate 5 active attachments
    const dummyAttachments = Array.from({ length: 5 }, (_, i) => ({
      ticketId,
      fileName: `prefilled_${i + 1}.png`,
      mimeType: 'image/png',
      sizeBytes: 1024,
      filePath: `/uploads/prefilled_${i + 1}.png`,
      isRemoved: false,
    }));

    await prisma.attachment.createMany({ data: dummyAttachments });
  });

  afterAll(async () => {
    await prisma.attachment.deleteMany({ where: { ticketId } });
    await prisma.ticket.delete({ where: { id: ticketId } });
    await prisma.$disconnect();
  });

  it('should return 409 Conflict when attempting to upload a 6th active attachment (TEST-010)', async () => {
    const dummyBuffer = Buffer.from('valid pdf content');

    const res = await request
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', String(requesterId))
      .attach('file', dummyBuffer, {
        filename: 'exceeding_quota.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ATTACHMENT_LIMIT_REACHED');
  });
});
