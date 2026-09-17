import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Sprint 3 Phase 2 — Database Schema & Seed Script Verification', () => {
  beforeAll(async () => {
    // Ensure database is connected and clean any legacy test users
    await prisma.$connect();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['attachmentUnitTest@example.com', 'unitTestUser@example.com']
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have seeded users matching exact role and status requirements', async () => {
    const requestersActive = await prisma.user.count({
      where: { role: 'REQUESTER', isActive: true }
    });
    const requestersInactive = await prisma.user.count({
      where: { role: 'REQUESTER', isActive: false }
    });

    const staffActive = await prisma.user.count({
      where: { role: 'IT_STAFF', isActive: true }
    });
    const staffInactive = await prisma.user.count({
      where: { role: 'IT_STAFF', isActive: false }
    });

    const adminActive = await prisma.user.count({
      where: { role: 'ADMINISTRATOR', isActive: true }
    });

    // Verification against specs
    expect(requestersActive).toBeGreaterThanOrEqual(4);
    expect(requestersInactive).toBeGreaterThanOrEqual(1);
    expect(staffActive).toBeGreaterThanOrEqual(3);
    expect(staffInactive).toBeGreaterThanOrEqual(1);
    expect(adminActive).toBeGreaterThanOrEqual(1);
  });

  it('should enforce encrypted password hashes and reject plaintext storage', async () => {
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThan(0);

    for (const user of users) {
      // Password must not be plaintext 'Password123!'
      expect(user.passwordHash).not.toBe('Password123!');
      // Password must be a valid bcrypt hash ($2a$, $2b$, or $2y$)
      const isValidBcrypt = user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2y$');
      if (!isValidBcrypt) {
        console.error('Invalid hash format for user:', user.email, 'hash:', user.passwordHash);
      }
      expect(isValidBcrypt).toBe(true);
      // Validating password hash against default password
      const isMatch = bcrypt.compareSync('Password123!', user.passwordHash);
      expect(isMatch).toBe(true);
    }
  });

  it('should correctly link Tickets with Requesters, Owners, IT Priority, Comments and Notes', async () => {
    const tickets = await prisma.ticket.findMany({
      include: {
        requester: true,
        owner: true,
        category: true,
        relatedSystem: true,
        publicComments: true,
        internalNotes: true
      }
    });

    expect(tickets.length).toBeGreaterThanOrEqual(10);

    // Verify all tickets have valid requester
    for (const ticket of tickets) {
      expect(ticket.requester).toBeDefined();
      expect(ticket.requester.id).toBe(ticket.requesterId);
      expect(ticket.itPriority).toBeDefined();
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(ticket.itPriority);
    }

    // Verify assigned ticket owners have IT_STAFF or ADMINISTRATOR role
    const assignedTickets = tickets.filter((t) => t.ownerId !== null);
    expect(assignedTickets.length).toBeGreaterThan(0);

    for (const ticket of assignedTickets) {
      expect(ticket.owner).toBeDefined();
      expect(['IT_STAFF', 'ADMINISTRATOR']).toContain(ticket.owner?.role);
    }

    // Verify public comments and internal notes relations
    const ticketWithComments = tickets.find((t) => t.publicComments.length > 0);
    expect(ticketWithComments).toBeDefined();
    expect(ticketWithComments?.publicComments[0].content).toBeTruthy();

    const ticketWithNotes = tickets.find((t) => t.internalNotes.length > 0);
    expect(ticketWithNotes).toBeDefined();
    expect(ticketWithNotes?.internalNotes[0].content).toBeTruthy();
  });
});
