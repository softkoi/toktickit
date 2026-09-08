import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Test: Attachment Soft Removal Validation (TEST-021 / BR-04 / AC-13)', () => {
  let userId: number;
  let attachmentId: number;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'removeValUser@example.com' },
      update: { isActive: true },
      create: { id: 922, name: 'Remove Val User', email: 'removeValUser@example.com', isActive: true },
    });
    userId = user.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Remove Val Test Cat' },
      update: { isActive: true },
      create: { id: 922, name: 'Remove Val Test Cat', isActive: true },
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Remove Val Test Sys' },
      update: { isActive: true },
      create: { id: 922, name: 'Remove Val Test Sys', isActive: true },
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-2026-922001',
        requesterId: userId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Remove Val Test Ticket',
        description: 'Testing soft removal reason length validation',
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    });

    const att = await prisma.attachment.create({
      data: {
        ticketId: ticket.id,
        fileName: 'remove-val-test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 500,
        filePath: '/uploads/remove-val-test.pdf',
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

  it('should return 400 Bad Request with VALIDATION_ERROR when removalReason is empty or under 5 characters (TEST-021)', async () => {
    const res = await request(app)
      .patch(`/api/attachments/${attachmentId}/remove`)
      .set('X-Requester-Id', String(userId))
      .send({ removalReason: '  123  ' }); // 3 characters trimmed

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('removalReason');
  });
});
