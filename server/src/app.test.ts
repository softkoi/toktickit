import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('GET /api/health', () => {
  it('should return status 200 and ok message', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Server is running' });
  });
});
