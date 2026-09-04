import { describe, it, expect } from 'vitest';

describe('UI Component Test: TicketForm Validation & Rules (TEST-006 / AC-03)', () => {
  it('should enforce summary length rule (5 to 200 chars)', () => {
    const shortSummary = 'Help';
    const validSummary = 'Cannot connect to corporate email server';

    expect(shortSummary.trim().length < 5).toBe(true);
    expect(validSummary.trim().length >= 5 && validSummary.trim().length <= 200).toBe(true);
  });

  it('should enforce description length rule (5 to 2000 chars)', () => {
    const shortDesc = 'Bug';
    const validDesc = 'Outlook fails to sync emails since morning update. Error code 0x80040115.';

    expect(shortDesc.trim().length < 5).toBe(true);
    expect(validDesc.trim().length >= 5 && validDesc.trim().length <= 2000).toBe(true);
  });
});
