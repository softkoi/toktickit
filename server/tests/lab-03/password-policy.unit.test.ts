import { describe, it, expect } from 'vitest';
import { validatePasswordPolicy } from '../../src/utils/passwordPolicy';

describe('TEST-004: Password Boundary & Policy Validation', () => {
  it('should accept a valid password that meets all criteria', () => {
    expect(validatePasswordPolicy('Password123!')).toBe(true);
    expect(validatePasswordPolicy('SecureP@ssw0rd')).toBe(true);
    expect(validatePasswordPolicy('Complex#2026$')).toBe(true);
  });

  it('should reject passwords shorter than 8 characters', () => {
    expect(validatePasswordPolicy('Pass1!')).toBe(false);
    expect(validatePasswordPolicy('P@ss1')).toBe(false);
    expect(validatePasswordPolicy('1234567')).toBe(false);
  });

  it('should reject passwords longer than 128 characters (bcrypt DoS protection)', () => {
    const longPassword = 'P' + 'a'.repeat(125) + '1!';
    expect(longPassword.length).toBe(128);
    expect(validatePasswordPolicy(longPassword)).toBe(true);

    const extraLongPassword = 'P' + 'a'.repeat(126) + '1!';
    expect(extraLongPassword.length).toBe(129);
    expect(validatePasswordPolicy(extraLongPassword)).toBe(false);
  });

  it('should reject passwords missing an uppercase letter', () => {
    expect(validatePasswordPolicy('password123!')).toBe(false);
  });

  it('should reject passwords missing a lowercase letter', () => {
    expect(validatePasswordPolicy('PASSWORD123!')).toBe(false);
  });

  it('should reject passwords missing a digit', () => {
    expect(validatePasswordPolicy('Password!!!')).toBe(false);
  });

  it('should reject passwords missing a special character', () => {
    expect(validatePasswordPolicy('Password123')).toBe(false);
  });

  it('should handle empty string, null, or undefined gracefully', () => {
    expect(validatePasswordPolicy('')).toBe(false);
    expect(validatePasswordPolicy(null as unknown as string)).toBe(false);
    expect(validatePasswordPolicy(undefined as unknown as string)).toBe(false);
  });
});
