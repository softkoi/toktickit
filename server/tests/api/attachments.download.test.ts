import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

describe('API Test: GET /api/attachments/:id/download (TEST-019 / TEST-022 / AC-12 / AC-14)', () => {
  let userId: number;
  let otherUserId: number;
  let activeAttachmentId: number;
  let removedAttachmentId: number;
  let sampleFilePath: string;

  beforeAll(async () => {
    const user = await prisma.requesterUser.upsert({
      where: { email: 'dlUser@example.com' },
      update: { isActive: true },
      create: { id: 919, name: 'Download User', email: 'dlUser@example.com', isActive: true },
    });
    userId = user.id;

    const otherUser = await prisma.requesterUser.upsert({
      where: { email: 'otherDlUser@example.com' },
      update: { isActive: true },
      create: { id: 920, name: 'Other Download User', email: 'otherDlUser@example.com', isActive: true },
    });
    otherUserId = otherUser.id;

    const cat = await prisma.category.upsert({
      where: { name: 'Download Test Cat' },
      update: { isActive: true },
      create: { id: 919, name: 'Download Test Cat', isActive: true },
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Download Test Sys' },
      update: { isActive: true },
      create: { id: 919, name: 'Download Test Sys', isActive: true },
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-2026-919001',
        requesterId: userId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Download Test Ticket',
        description: 'Testing file downloads',
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    });

    // Create a real temp file for download test
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    sampleFilePath = path.join(uploadsDir, 'test-download-file.txt');
    fs.writeFileSync(sampleFilePath, 'Hello World Test Content');

    const activeAtt = await prisma.attachment.create({
      data: {
        ticketId: ticket.id,
        fileName: 'test-download-file.txt',
        mimeType: 'text/plain',
        sizeBytes: 23,
        filePath: sampleFilePath,
        isRemoved: false,
      },
    });
    activeAttachmentId = activeAtt.id;

    const removedAtt = await prisma.attachment.create({
      data: {
        ticketId: ticket.id,
        fileName: 'removed-file.txt',
        mimeType: 'text/plain',
        sizeBytes: 20,
        filePath: sampleFilePath,
        isRemoved: true,
        removedAt: new Date(),
        removalReason: 'File duplicated',
      },
    });
    removedAttachmentId = removedAtt.id;
  });

  afterAll(async () => {
    if (fs.existsSync(sampleFilePath)) {
      try {
        fs.unlinkSync(sampleFilePath);
      } catch {}
    }
    await prisma.attachment.deleteMany({ where: { id: { in: [activeAttachmentId, removedAttachmentId] } } });
    await prisma.ticket.deleteMany({ where: { requesterId: { in: [userId, otherUserId] } } });
    await prisma.$disconnect();
  });

  it('should download active file successfully with 200 OK (TEST-019)', async () => {
    const res = await request(app)
      .get(`/api/attachments/${activeAttachmentId}/download`)
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/plain');
  });

  it('should return 409 Conflict when attempting to download a soft-removed attachment (TEST-022 / BR-07)', async () => {
    const res = await request(app)
      .get(`/api/attachments/${removedAttachmentId}/download`)
      .set('X-Requester-Id', String(userId));

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ATTACHMENT_REMOVED');
  });

  it('should return 403 Forbidden when trying to download another user attachment (TEST-025)', async () => {
    const res = await request(app)
      .get(`/api/attachments/${activeAttachmentId}/download`)
      .set('X-Requester-Id', String(otherUserId));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
