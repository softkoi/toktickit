import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      category = {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, name: 'Account and Access' },
          { id: 2, name: 'Hardware' },
          { id: 3, name: 'Software' },
          { id: 4, name: 'Network' },
        ]),
      };
    },
  };
});

describe('GET /api/categories (API-02)', () => {
  it('should return HTTP 200 and list of categories', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    const categories = Array.isArray(response.body) ? response.body : response.body.data;
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty('id');
    expect(categories[0]).toHaveProperty('name');
  });
});
