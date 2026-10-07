import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { createSessionToken } from '../../src/utils/session';

const prisma = new PrismaClient();

describe('API Integration Tests: Actions Taken Endpoints (Lab 04)', () => {
  let requesterId: number;
  let otherRequesterId: number;
  let staffId: number;

  let requesterToken: string;
  let otherRequesterToken: string;
  let staffToken: string;

  let ticketId: number;
  let otherTicketId: number;
  let createdActionId: number;

  beforeAll(async () => {
    // 1. Create or fetch test users
    const reqUser = await prisma.user.upsert({
      where: { email: 'act_req1@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Action Requester One',
        email: 'act_req1@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'REQUESTER',
        isActive: true
      }
    });
    requesterId = reqUser.id;

    const otherReqUser = await prisma.user.upsert({
      where: { email: 'act_req2@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Action Requester Two',
        email: 'act_req2@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'REQUESTER',
        isActive: true
      }
    });
    otherRequesterId = otherReqUser.id;

    const staffUser = await prisma.user.upsert({
      where: { email: 'act_staff1@toktickit.com' },
      update: { isActive: true },
      create: {
        name: 'Action Staff One',
        email: 'act_staff1@toktickit.com',
        passwordHash: 'hashed_pw',
        role: 'IT_STAFF',
        isActive: true
      }
    });
    staffId = staffUser.id;

    // Create session tokens
    requesterToken = `toktickit_session=${createSessionToken({ userId: requesterId, email: reqUser.email, role: reqUser.role })}`;
    otherRequesterToken = `toktickit_session=${createSessionToken({ userId: otherRequesterId, email: otherReqUser.email, role: otherReqUser.role })}`;
    staffToken = `toktickit_session=${createSessionToken({ userId: staffId, email: staffUser.email, role: staffUser.role })}`;

    // Create test category and system if needed
    const cat = await prisma.category.upsert({
      where: { name: 'Action Test Category' },
      update: { isActive: true },
      create: { name: 'Action Test Category', isActive: true }
    });

    const sys = await prisma.relatedSystem.upsert({
      where: { name: 'Action Test System' },
      update: { isActive: true },
      create: { name: 'Action Test System', isActive: true }
    });

    // Create tickets
    const ticket1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-ACT-001',
        requesterId: requesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Test ticket for actions taken',
        description: 'Detailed description for testing actions taken',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'IN_PROGRESS'
      }
    });
    ticketId = ticket1.id;

    const ticket2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TK-LAB4-ACT-002',
        requesterId: otherRequesterId,
        ownerId: staffId,
        categoryId: cat.id,
        relatedSystemId: sys.id,
        summary: 'Other test ticket for actions taken',
        description: 'Detailed description for testing actions taken ownership',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'OPEN'
      }
    });
    otherTicketId = ticket2.id;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.actionTaken.deleteMany({ where: { ticketId: { in: [ticketId, otherTicketId] } } });
    await prisma.ticket.deleteMany({ where: { id: { in: [ticketId, otherTicketId] } } });
    await prisma.$disconnect();
  });

  describe('1. GET /api/tickets/:id/actions-taken', () => {
    it('should return 401 Unauthorized if no session cookie is provided', async () => {
      const res = await request(app).get(`/api/tickets/${ticketId}/actions-taken`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 Not Found if ticket does not exist', async () => {
      const res = await request(app)
        .get('/api/tickets/999999/actions-taken')
        .set('Cookie', staffToken);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 Forbidden if Requester tries to view actions for another user ticket', async () => {
      const res = await request(app)
        .get(`/api/tickets/${otherTicketId}/actions-taken`)
        .set('Cookie', requesterToken);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow Requester to view actions taken on their own ticket', async () => {
      const res = await request(app)
        .get(`/api/tickets/${ticketId}/actions-taken`)
        .set('Cookie', requesterToken);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('actionsTaken');
      expect(Array.isArray(res.body.actionsTaken)).toBe(true);
    });

    it('should allow IT Staff to view actions taken on any ticket', async () => {
      const res = await request(app)
        .get(`/api/tickets/${otherTicketId}/actions-taken`)
        .set('Cookie', staffToken);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('actionsTaken');
    });
  });

  describe('2. POST /api/tickets/:id/actions-taken', () => {
    it('should return 403 Forbidden if Requester attempts to create an action taken', async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/actions-taken`)
        .set('Cookie', requesterToken)
        .send({
          description: 'Requester trying to add action',
          result: 'Should be blocked',
          followUpRequired: false
        });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 Bad Request if description or result is missing or too short', async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/actions-taken`)
        .set('Cookie', staffToken)
        .send({
          description: 'AB',
          result: 'Valid result',
          followUpRequired: false
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_INPUT');
    });

    it('should return 400 Bad Request if followUpRequired is true but followUpNote is missing', async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/actions-taken`)
        .set('Cookie', staffToken)
        .send({
          description: 'Replaced thermal paste and cleaned fan.',
          result: 'CPU temperature dropped by 15C.',
          followUpRequired: true,
          followUpNote: ''
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_INPUT');
    });

    it('should allow IT Staff to successfully create an Action Taken entry', async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/actions-taken`)
        .set('Cookie', staffToken)
        .send({
          description: 'Replaced thermal paste and cleaned fan assembly.',
          result: 'CPU temperature dropped by 15C during stress test.',
          followUpRequired: true,
          followUpNote: 'Check temperatures again in 48 hours.',
          attachmentNotes: 'Thermal log attached.'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('actionTaken');
      expect(res.body.actionTaken.description).toBe('Replaced thermal paste and cleaned fan assembly.');
      expect(res.body.actionTaken.performedBy.id).toBe(staffId);
      createdActionId = res.body.actionTaken.id;
    });
  });

  describe('3. PUT /api/actions-taken/:actionId', () => {
    it('should return 403 Forbidden if Requester attempts to update an action taken', async () => {
      const res = await request(app)
        .put(`/api/actions-taken/${createdActionId}`)
        .set('Cookie', requesterToken)
        .send({
          description: 'Requester updating action',
          result: 'Should fail'
        });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 Not Found if action ID does not exist', async () => {
      const res = await request(app)
        .put('/api/actions-taken/999999')
        .set('Cookie', staffToken)
        .send({
          description: 'Valid description update',
          result: 'Valid result update'
        });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should allow IT Staff to update an existing Action Taken record', async () => {
      const res = await request(app)
        .put(`/api/actions-taken/${createdActionId}`)
        .set('Cookie', staffToken)
        .send({
          description: 'Replaced thermal paste, cleaned fan assembly, and updated BIOS.',
          result: 'CPU temperature stabilized at 42C under normal load.',
          followUpRequired: false,
          followUpNote: null
        });
      expect(res.status).toBe(200);
      expect(res.body.actionTaken.description).toContain('updated BIOS');
      expect(res.body.actionTaken.followUpRequired).toBe(false);
    });
  });
});
