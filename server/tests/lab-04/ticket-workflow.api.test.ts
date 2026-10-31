import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { createSessionToken } from '../../src/utils/session';

const prisma = new PrismaClient();

describe('API Integration Tests: Ticket Workflow & Formal Resolution Gate (Lab 04)', () => {
  let requesterId: number;
  let staffId: number;

  let requesterToken: string;
  let staffToken: string;

  let ticketNewId: number;
  let ticketInProgressId: number;
  let ticketOpenId: number;

  beforeAll(async () => {
    // 1. Create or fetch test users
    const reqUser = await prisma.user.upsert({
      where: { email: 'wf_req@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Workflow Requester',
        email: 'wf_req@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'REQUESTER',
        isActive: true
      }
    });
    requesterId = reqUser.id;

    const staffUser = await prisma.user.upsert({
      where: { email: 'wf_staff@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Workflow Staff',
        email: 'wf_staff@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'IT_STAFF',
        isActive: true
      }
    });
    staffId = staffUser.id;

    requesterToken = `toktickit_session=${createSessionToken({ userId: requesterId, email: reqUser.email, role: reqUser.role })}`;
    staffToken = `toktickit_session=${createSessionToken({ userId: staffId, email: staffUser.email, role: staffUser.role })}`;

    const cat = await prisma.category.upsert({
      where: { name: 'Workflow Test Category' },
      update: { isActive: true },
      create: { name: 'Workflow Test Category', isActive: true }
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Workflow Test System' },
      update: { isActive: true },
      create: { name: 'Workflow Test System', isActive: true }
    });

    // Create tickets with different initial states
    const tNew = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-WF-001',
        requesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'New workflow ticket',
        description: 'Testing status transitions starting from NEW',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'NEW'
      }
    });
    ticketNewId = tNew.id;

    const tInProgress = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-WF-002',
        requesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'In progress workflow ticket',
        description: 'Testing transition from IN_PROGRESS to RESOLVED',
        requestedPriority: 'HIGH',
        itPriority: 'HIGH',
        currentStatus: 'IN_PROGRESS'
      }
    });
    ticketInProgressId = tInProgress.id;

    const tOpen = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-WF-003',
        requesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Open workflow ticket',
        description: 'Testing requester resolution advisory',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'OPEN'
      }
    });
    ticketOpenId = tOpen.id;
  });

  afterAll(async () => {
    await prisma.publicComment.deleteMany({
      where: { ticketId: { in: [ticketNewId, ticketInProgressId, ticketOpenId] } }
    });
    await prisma.ticket.deleteMany({
      where: { id: { in: [ticketNewId, ticketInProgressId, ticketOpenId] } }
    });
    await prisma.$disconnect();
  });

  // API-06: IT Staff transitions Ticket from IN_PROGRESS to RESOLVED (AC-03 / BR-05)
  it('API-06: IT Staff should successfully transition Ticket from IN_PROGRESS to RESOLVED', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketInProgressId}/status`)
      .set('Cookie', staffToken)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(200);
    expect(res.body.ticket).toBeDefined();
    expect(res.body.ticket.currentStatus).toBe('RESOLVED');

    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticketInProgressId } });
    expect(dbTicket?.currentStatus).toBe('RESOLVED');
  });

  // API-07: Attempt invalid status transition (NEW directly to CLOSED) (AC-03 / BR-05)
  it('API-07: should reject invalid status transition from NEW directly to CLOSED with 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketNewId}/status`)
      .set('Cookie', staffToken)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
    expect(res.body.error.details?.permittedNextStatuses).toBeDefined();
    expect(res.body.error.details.permittedNextStatuses).toContain('OPEN');

    // Verify status was not modified
    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticketNewId } });
    expect(dbTicket?.currentStatus).toBe('NEW');
  });

  // API-08: Requester submits "Problem Appears Resolved" advisory input (AC-04 / BR-06)
  it('API-08: Requester "Problem Appears Resolved" creates advisory log without transitioning to RESOLVED', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketOpenId}/resolve-request`)
      .set('Cookie', requesterToken)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.advisory).toBe(true);

    // Verify ticket status is NOT RESOLVED
    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticketOpenId } });
    expect(dbTicket?.currentStatus).not.toBe('RESOLVED');

    // Verify advisory comment was logged
    const comments = await prisma.publicComment.findMany({ where: { ticketId: ticketOpenId } });
    expect(comments.some(c => c.content.includes('[Advisory]'))).toBe(true);
  });

  // API-09: Requester attempts direct status change to RESOLVED via raw API (AC-03 / BR-06)
  it('API-09: Requester attempting direct status modification must be rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketOpenId}/status`)
      .set('Cookie', requesterToken)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();

    // Verify status in DB did NOT become RESOLVED
    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticketOpenId } });
    expect(dbTicket?.currentStatus).not.toBe('RESOLVED');
  });

  // API-12: Optimistic concurrency control: outdated timestamp returns 409 Conflict (AC-06 / BR-08)
  it('API-12: should return 409 Conflict when submitting status update with stale lastKnownUpdatedAt timestamp', async () => {
    const outdatedTimestamp = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketNewId}/status`)
      .set('Cookie', staffToken)
      .send({
        status: 'OPEN',
        lastKnownUpdatedAt: outdatedTimestamp
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
