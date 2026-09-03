import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Integration Test: POST /api/tickets Validation Failures (TEST-005 / AC-03)', () => {
  let requesterId = 1;

  beforeAll(async () => {
    const reqUser = await prisma.requesterUser.upsert({
      where: { email: 'validation.tester@example.com' },
      update: { isActive: true },
      create: { name: 'Validation Tester', email: 'validation.tester@example.com', isActive: true },
    });
    requesterId = reqUser.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 400 Bad Request when header X-Requester-Id is missing', async () => {
    const res = await request(app).post('/api/tickets').send({
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: 'LOW',
      summary: 'Valid summary text',
      description: 'Valid description text',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUESTER_HEADER');
  });

  it('should return 400 Bad Request with VALIDATION_ERROR when summary is too short (<5 chars)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('X-Requester-Id', String(requesterId))
      .send({
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: 'LOW',
        summary: 'Help',
        description: 'Valid description text here',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'summary' }),
      ])
    );
  });

  it('should return 400 Bad Request when categoryId is invalid or inactive', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('X-Requester-Id', String(requesterId))
      .send({
        categoryId: 999999,
        relatedSystemId: 1,
        requestedPriority: 'MEDIUM',
        summary: 'Valid summary text here',
        description: 'Valid description text here',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'categoryId' }),
      ])
    );
  });
});
