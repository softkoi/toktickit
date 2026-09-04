import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  getActiveAttachmentCount,
  canAddAttachment,
  MAX_ACTIVE_ATTACHMENTS,
} from '../../src/services/attachment.service';
import { generateTicketNumber } from '../../src/utils/ticket-number.generator';

const prisma = new PrismaClient();

describe('Unit Test: Attachment Service (TEST-011 / BR-05 / AC-06)', () => {
  let testTicketId: number;

  beforeAll(async () => {
    // Seed prerequisite data for ticket
    const requester = await prisma.requesterUser.upsert({
      where: { email: 'attachmentUnitTest@example.com' },
      update: { isActive: true },
      create: { id: 998, name: 'Attachment Test User', email: 'attachmentUnitTest@example.com', isActive: true },
    });

    const category = await prisma.category.upsert({
      where: { name: 'Attachment Unit Test Category' },
      update: { isActive: true },
      create: { id: 998, name: 'Attachment Unit Test Category', isActive: true },
    });

    const system = await prisma.relatedSystem.upsert({
      where: { name: 'Attachment Unit Test System' },
      update: { isActive: true },
      create: { id: 998, name: 'Attachment Unit Test System', isActive: true },
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-${new Date().getFullYear()}-000104`,
        requesterId: requester.id,
        categoryId: category.id,
        relatedSystemId: system.id,
        summary: 'Attachment Unit Test Ticket',
        description: 'Testing active attachment count calculations',
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    });

    testTicketId = ticket.id;
  });

  beforeEach(async () => {
    // Clean up attachments for testTicketId before each test
    await prisma.attachment.deleteMany({
      where: { ticketId: testTicketId },
    });
  });

  afterAll(async () => {
    // Clean up test ticket and related data
    await prisma.attachment.deleteMany({
      where: { ticketId: testTicketId },
    });
    await prisma.ticket.delete({
      where: { id: testTicketId },
    });
    await prisma.$disconnect();
  });

  it('should return 0 active attachments when no attachments exist', async () => {
    const count = await getActiveAttachmentCount(testTicketId, prisma);
    expect(count).toBe(0);
    const canAdd = await canAddAttachment(testTicketId, prisma);
    expect(canAdd).toBe(true);
  });

  it('should correctly count active attachments and ignore soft-removed attachments (TEST-011)', async () => {
    // Create 2 active attachments
    await prisma.attachment.createMany({
      data: [
        {
          ticketId: testTicketId,
          fileName: 'active1.png',
          mimeType: 'image/png',
          sizeBytes: 1000,
          filePath: '/uploads/active1.png',
          isRemoved: false,
        },
        {
          ticketId: testTicketId,
          fileName: 'active2.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 2000,
          filePath: '/uploads/active2.pdf',
          isRemoved: false,
        },
        // Create 1 soft-removed attachment
        {
          ticketId: testTicketId,
          fileName: 'removed1.png',
          mimeType: 'image/png',
          sizeBytes: 1500,
          filePath: '/uploads/removed1.png',
          isRemoved: true,
          removedAt: new Date(),
          removalReason: 'Wrong file uploaded',
        },
      ],
    });

    const activeCount = await getActiveAttachmentCount(testTicketId, prisma);
    expect(activeCount).toBe(2);

    const canAdd = await canAddAttachment(testTicketId, prisma);
    expect(canAdd).toBe(true);
  });

  it('should reject adding attachments when active count reaches quota limit (5 files)', async () => {
    // Create 5 active attachments
    const activeFiles = Array.from({ length: MAX_ACTIVE_ATTACHMENTS }, (_, i) => ({
      ticketId: testTicketId,
      fileName: `file_${i + 1}.png`,
      mimeType: 'image/png',
      sizeBytes: 1000,
      filePath: `/uploads/file_${i + 1}.png`,
      isRemoved: false,
    }));

    await prisma.attachment.createMany({
      data: activeFiles,
    });

    const activeCount = await getActiveAttachmentCount(testTicketId, prisma);
    expect(activeCount).toBe(5);

    const canAdd = await canAddAttachment(testTicketId, prisma);
    expect(canAdd).toBe(false);
  });
});
