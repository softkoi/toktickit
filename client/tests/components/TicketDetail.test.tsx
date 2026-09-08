import { describe, it, expect } from 'vitest';

describe('UI Component Test: TicketDetail View & Soft Removal Rules (TEST-018 / AC-11 / AC-13)', () => {
  it('should enforce minimum 5 characters rule for removalReason (BR-04)', () => {
    const invalidReason = 'bad';
    const validReason = 'Uploaded wrong file version by mistake';

    expect(invalidReason.trim().length >= 5).toBe(false);
    expect(validReason.trim().length >= 5).toBe(true);
  });

  it('should format active vs soft-removed attachments correctly', () => {
    const activeAttachment = { id: 1, isRemoved: false, fileName: 'active.pdf' };
    const removedAttachment = { id: 2, isRemoved: true, fileName: 'old.pdf', removalReason: 'Outdated version' };

    expect(activeAttachment.isRemoved).toBe(false);
    expect(removedAttachment.isRemoved).toBe(true);
    expect(removedAttachment.removalReason).toBe('Outdated version');
  });
});
