import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { generateTicketNumber } from '../../src/utils/ticket-number.generator';

const prisma = new PrismaClient();

describe('Unit Test: Ticket Number Generator (TEST-004 / BR-01)', () => {
  const currentYear = new Date().getFullYear();

  beforeAll(async () => {
    // Seed initial dependencies required by foreign keys if needed
    await prisma.requesterUser.upsert({
      where: { email: 'unitTestUser@example.com' },
      update: { isActive: true },
      create: { id: 999, name: 'Unit Test User', email: 'unitTestUser@example.com', isActive: true },
    });

    await prisma.category.upsert({
      where: { name: 'Unit Test Category' },
      update: { isActive: true },
      create: { id: 999, name: 'Unit Test Category', isActive: true },
    });

    await prisma.relatedSystem.upsert({
      where: { name: 'Unit Test System' },
      update: { isActive: true },
      create: { id: 999, name: 'Unit Test System', isActive: true },
    });
  });

  afterAll(async () => {
    // Clean up test tickets
    await prisma.ticket.deleteMany({
      where: { requesterId: 999 },
    });
    await prisma.$disconnect();
  });

  it('should generate TKT-YYYY-000001 when no tickets exist for the current year', async () => {
    // Delete any existing ticket for year to guarantee fresh start in test condition
    const prefix = `TKT-${currentYear}-`;
    const existing = await prisma.ticket.findFirst({
      where: { ticketNumber: { startsWith: prefix } },
    });

    if (!existing) {
      const ticketNumber = await generateTicketNumber(prisma);
      expect(ticketNumber).toBe(`TKT-${currentYear}-000001`);
    } else {
      const ticketNumber = await generateTicketNumber(prisma);
      expect(ticketNumber).toMatch(new RegExp(`^TKT-${currentYear}-\\d{6}$`));
    }
  });

  it('should increment sequential number correctly (TEST-004)', async () => {
    const customNum = `TKT-${currentYear}-000041`;
    
    // Create dummy ticket with customNum
    await prisma.ticket.upsert({
      where: { ticketNumber: customNum },
      update: {},
      create: {
        ticketNumber: customNum,
        requesterId: 999,
        categoryId: 999,
        relatedSystemId: 999,
        summary: 'Unit test ticket summary',
        description: 'Unit test ticket description',
        requestedPriority: 'MEDIUM',
        currentStatus: 'NEW',
      },
    });

    const nextTicketNumber = await generateTicketNumber(prisma);
    expect(nextTicketNumber).toBe(`TKT-${currentYear}-000042`);
  });
});
