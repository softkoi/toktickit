import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../src/app';
import { generateTicketNumber } from '../../src/utils/ticket-number.generator';

const prisma = new PrismaClient();
const request = supertest(app);

describe('API Test: Attachment Validation & Ownership (TEST-008 / TEST-009 / AC-05 / BR-09)', () => {
  let requesterId: number;
  let otherRequesterId: number;
  let ticketId: number;

  beforeAll(async () => {
    const user1 = await prisma.requesterUser.upsert({
      where: { email: 'valUser1@example.com' },
      update: { isActive: true },
      create: { id: 996, name: 'Validation User 1', email: 'valUser1@example.com', isActive: true },
    });
    requesterId = user1.id;

    const user2 = await prisma.requesterUser.upsert({
      where: { email: 'valUser2@example.com' },
      update: { isActive: true },
      create: { id: 995, name: 'Validation User 2', email: 'valUser2@example.com', isActive: true },
    });
    otherRequesterId = user2.id;

    const category = await prisma.category.upsert({
      where: { name: 'Validation Category' },
      update: { isActive: true },
      create: { id: 996, name: 'Validation Category', isActive: true },
    });

    const system = await prisma.relatedSystem.upsert({
      where: { name: 'Validation System' },
      update: { isActive: true },
      create: { id: 996, name: 'Validation System', isActive: true },
    });

    const ticketNumber = `TKT-${new Date().getFullYear()}-000102`;
    await prisma.attachment.deleteMany({ where: { ticket: { ticketNumber } } });
    await prisma.ticket.deleteMany({ where: { ticketNumber } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: requesterId,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: 'Validation Test Ticket',
        description: 'Testing validation error handling for attachments',
        requestedPriority: 'HIGH',
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

  it('should return 413 Payload Too Large when file size exceeds 5MB (TEST-008)', async () => {
    // Buffer slightly over 5MB (5,242,881 bytes)
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);

    const res = await request
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', String(requesterId))
      .attach('file', oversizedBuffer, {
        filename: 'large_file.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('should return 415 Unsupported Media Type for invalid file extensions/MIME (TEST-009)', async () => {
    const dummyBuffer = Buffer.from('executable binary code');

    const res = await request
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', String(requesterId))
      .attach('file', dummyBuffer, {
        filename: 'malicious.exe',
        contentType: 'application/x-msdownload',
      });

    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNSUPPORTED_FILE_TYPE');
  });

  it('should return 403 Forbidden when trying to upload to another requester ticket (BR-09)', async () => {
    const dummyBuffer = Buffer.from('valid png content');

    const res = await request
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', String(otherRequesterId))
      .attach('file', dummyBuffer, {
        filename: 'stolen.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 404 Not Found for non-existent ticket ID', async () => {
    const dummyBuffer = Buffer.from('valid pdf content');

    const res = await request
      .post('/api/tickets/99999999/attachments')
      .set('X-Requester-Id', String(requesterId))
      .attach('file', dummyBuffer, {
        filename: 'doc.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
