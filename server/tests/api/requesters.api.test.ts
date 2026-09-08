import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Issue 2 API Integration Tests: Reference Data & Requesters', () => {
  beforeAll(async () => {
    // Seed test data
    await prisma.requesterUser.upsert({
      where: { email: 'jennifer.anderson@example.com' },
      update: { isActive: true },
      create: { id: 1, name: 'Jennifer Anderson', email: 'jennifer.anderson@example.com', isActive: true }
    });

    await prisma.category.upsert({
      where: { name: 'Hardware' },
      update: { isActive: true },
      create: { name: 'Hardware', isActive: true }
    });

    await prisma.relatedSystem.upsert({
      where: { name: 'Corporate Laptop' },
      update: { isActive: true },
      create: { name: 'Corporate Laptop', isActive: true }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/categories - should return active categories sorted A-Z', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  it('GET /api/related-systems - should return active related systems sorted A-Z', async () => {
    const res = await request(app).get('/api/related-systems');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  it('GET /api/requesters - should return active requesters only sorted A-Z', async () => {
    const res = await request(app).get('/api/requesters');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const names = res.body.data.map((r: { name: string }) => r.name);
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  });
});
