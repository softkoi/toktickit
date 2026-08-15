import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from './app';

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

describe('GET /api/health', () => {
  it('should return HTTP 200 with status ok and service name', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'TokTickIT API',
    });
  });
});

describe('GET /api/categories', () => {
  it('should return HTTP 200 and list of categories', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
