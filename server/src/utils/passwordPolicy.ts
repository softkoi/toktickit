/**
 * Validates password policy according to BR-03 / TEST-004:
 * - Length between 8 and 128 characters (to prevent bcrypt DoS attack)
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (non-alphanumeric or punctuation)
 */
export function validatePasswordPolicy(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Reject passwords with spaces / whitespace
  if (/\s/.test(password)) {
    return false;
  }

  // Length check: 8 <= length <= 128
  if (password.length < 8 || password.length > 128) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // Special character: anything that is not a letter or number, or standard special chars
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}
