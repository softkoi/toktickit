import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { createSessionToken } from '../../src/utils/session';

const prisma = new PrismaClient();

describe('API Integration Tests: Role-Based Dashboards (Lab 04)', () => {
  let requesterId: number;
  let otherRequesterId: number;
  let staffId: number;

  let requesterToken: string;
  let staffToken: string;

  let ticket1Id: number;
  let ticket2Id: number;
  let otherTicketId: number;

  beforeAll(async () => {
    // 1. Create or fetch test users
    const reqUser = await prisma.user.upsert({
      where: { email: 'dash_req@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Dashboard Requester',
        email: 'dash_req@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'REQUESTER',
        isActive: true
      }
    });
    requesterId = reqUser.id;

    const otherReqUser = await prisma.user.upsert({
      where: { email: 'dash_other_req@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Other Requester',
        email: 'dash_other_req@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'REQUESTER',
        isActive: true
      }
    });
    otherRequesterId = otherReqUser.id;

    const staffUser = await prisma.user.upsert({
      where: { email: 'dash_staff@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Dashboard Staff',
        email: 'dash_staff@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'IT_STAFF',
        isActive: true
      }
    });
    staffId = staffUser.id;

    requesterToken = `toktickit_session=${createSessionToken({ userId: requesterId, email: reqUser.email, role: reqUser.role })}`;
    staffToken = `toktickit_session=${createSessionToken({ userId: staffId, email: staffUser.email, role: staffUser.role })}`;

    const cat = await prisma.category.upsert({
      where: { name: 'Dashboard Test Category' },
      update: { isActive: true },
      create: { name: 'Dashboard Test Category', isActive: true }
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Dashboard Test System' },
      update: { isActive: true },
      create: { name: 'Dashboard Test System', isActive: true }
    });

    // Create tickets
    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-DASH-001',
        requesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Requester open ticket',
        description: 'Dashboard test ticket 1',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'OPEN'
      }
    });
    ticket1Id = t1.id;

    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-DASH-002',
        requesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Requester in-progress ticket',
        description: 'Dashboard test ticket 2',
        requestedPriority: 'HIGH',
        itPriority: 'HIGH',
        currentStatus: 'IN_PROGRESS'
      }
    });
    ticket2Id = t2.id;

    const t3 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-DASH-003',
        requesterId: otherRequesterId,
        ownerId: null,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Other user ticket',
        description: 'Should not appear in requester 1 metrics',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'NEW'
      }
    });
    otherTicketId = t3.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { id: { in: [ticket1Id, ticket2Id, otherTicketId] } }
    });
    await prisma.$disconnect();
  });

  // API-10: Authenticated Requester fetches dashboard (AC-02 / BR-07)
  it('API-10: should return 200 OK with metrics scoped to authenticated Requester only', async () => {
    const res = await request(app)
      .get('/api/dashboard/requester')
      .set('Cookie', requesterToken);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics.totalOpenTickets).toBeGreaterThanOrEqual(2);
    expect(res.body.metrics.inProgressTickets).toBeGreaterThanOrEqual(1);

    // Verify recent tickets belong to this requester only
    expect(res.body.recentTickets).toBeDefined();
    for (const t of res.body.recentTickets) {
      expect(t.ticketNumber).not.toBe('TK-LAB4-DASH-003');
    }
  });

  // API-11: IT Staff fetches dashboard (AC-02 / BR-07)
  it('API-11: should return 200 OK with operational queue counts for IT Staff', async () => {
    const res = await request(app)
      .get('/api/dashboard/staff')
      .set('Cookie', staffToken);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics.openCount).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.inProgressCount).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.myAssignedCount).toBeGreaterThanOrEqual(2);
    expect(res.body.metrics.unassignedCount).toBeGreaterThanOrEqual(1);
    expect(res.body.recentTickets).toBeDefined();
  });

  it('should reject Requester access to IT Staff dashboard with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/dashboard/staff')
      .set('Cookie', requesterToken);

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });
});
