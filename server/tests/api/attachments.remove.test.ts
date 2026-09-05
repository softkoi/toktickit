import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: PATCH /api/attachments/:id/remove Soft Removal (TEST-020 / TEST-021 / TEST-023 / AC-13 / AC-14)', () => {
  let userId: number;
  let attachmentId: number;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'removeUser@example.com' },
      update: { isActive: true },
      create: { id: 921, name: 'Remove User', email: 'removeUser@example.com', isActive: true },
    });
    userId = user.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Remove Test Cat' },
      update: { isActive: true },
      create: { id: 921, name: 'Remove Test Cat', isActive: true },
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Remove Test Sys' },
      update: { isActive: true },
      create: { id: 921, name: 'Remove Test Sys', isActive: true },
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-2026-921001',
        requesterId: userId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Remove Test Ticket',
        description: 'Testing soft removal',
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    });

    const att = await prisma.attachment.create({
      data: {
        ticketId: ticket.id,
        fileName: 'remove-test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 500,
        filePath: '/uploads/remove-test.pdf',
        isRemoved: false,
      },
    });
    attachmentId = att.id;
  });

  afterAll(async () => {
    await prisma.attachment.deleteMany({ where: { id: attachmentId } });
    await prisma.ticket.deleteMany({ where: { requesterId: userId } });
    await prisma.$disconnect();
  });

  it('should reject removal when removalReason is shorter than 5 characters (TEST-021 / BR-04)', async () => {
    const res = await request(app)
      .patch(`/api/attachments/${attachmentId}/remove`)
      .set('X-Requester-Id', String(userId))
      .send({ removalReason: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should soft-remove attachment successfully with valid removalReason (TEST-020 / AC-13)', async () => {
    const res = await request(app)
      .patch(`/api/attachments/${attachmentId}/remove`)
      .set('X-Requester-Id', String(userId))
      .send({ removalReason: 'Uploaded incorrect document version' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRemoved).toBe(true);
    expect(res.body.data.removalReason).toBe('Uploaded incorrect document version');
    expect(res.body.data).toHaveProperty('removedAt');
  });

  it('should return 409 Conflict when attempting to soft-remove an already removed attachment (TEST-023)', async () => {
    const res = await request(app)
      .patch(`/api/attachments/${attachmentId}/remove`)
      .set('X-Requester-Id', String(userId))
      .send({ removalReason: 'Duplicate removal attempt' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ALREADY_REMOVED');
  });
});
