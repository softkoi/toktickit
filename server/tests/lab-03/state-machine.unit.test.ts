import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from '../../src/controllers/staff.controller';

describe('Ticket Status State Machine Unit Tests (TEST-019 / BR-11 / AC-08)', () => {
  it('should allow valid status transitions according to state machine matrix', () => {
    // NEW -> OPEN, CANCELLED
    expect(isValidStatusTransition('NEW', 'OPEN')).toBe(true);
    expect(isValidStatusTransition('NEW', 'CANCELLED')).toBe(true);

    // OPEN -> IN_PROGRESS, WAITING_FOR_REQUESTER, CANCELLED
    expect(isValidStatusTransition('OPEN', 'IN_PROGRESS')).toBe(true);
    expect(isValidStatusTransition('OPEN', 'WAITING_FOR_REQUESTER')).toBe(true);
    expect(isValidStatusTransition('OPEN', 'CANCELLED')).toBe(true);

    // IN_PROGRESS -> WAITING_FOR_REQUESTER, RESOLVED, CANCELLED
    expect(isValidStatusTransition('IN_PROGRESS', 'WAITING_FOR_REQUESTER')).toBe(true);
    expect(isValidStatusTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(isValidStatusTransition('IN_PROGRESS', 'CANCELLED')).toBe(true);

    // WAITING_FOR_REQUESTER -> IN_PROGRESS, RESOLVED, CANCELLED
    expect(isValidStatusTransition('WAITING_FOR_REQUESTER', 'IN_PROGRESS')).toBe(true);
    expect(isValidStatusTransition('WAITING_FOR_REQUESTER', 'RESOLVED')).toBe(true);

    // RESOLVED -> CLOSED, REOPENED
    expect(isValidStatusTransition('RESOLVED', 'CLOSED')).toBe(true);
    expect(isValidStatusTransition('RESOLVED', 'REOPENED')).toBe(true);

    // CLOSED -> REOPENED
    expect(isValidStatusTransition('CLOSED', 'REOPENED')).toBe(true);

    // REOPENED -> IN_PROGRESS, RESOLVED
    expect(isValidStatusTransition('REOPENED', 'IN_PROGRESS')).toBe(true);
    expect(isValidStatusTransition('REOPENED', 'RESOLVED')).toBe(true);
  });

  it('should reject invalid status transitions', () => {
    // NEW -> CLOSED (invalid)
    expect(isValidStatusTransition('NEW', 'CLOSED')).toBe(false);

    // NEW -> RESOLVED (invalid)
    expect(isValidStatusTransition('NEW', 'RESOLVED')).toBe(false);

    // OPEN -> CLOSED (invalid)
    expect(isValidStatusTransition('OPEN', 'CLOSED')).toBe(false);

    // CANCELLED is terminal -> no transitions allowed
    expect(isValidStatusTransition('CANCELLED', 'OPEN')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'IN_PROGRESS')).toBe(false);
  });
});
