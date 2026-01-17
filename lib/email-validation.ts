/**
 * Email validation utility.
 *
 * Uses a robust regex that covers most valid email formats while
 * being strict enough to catch common mistakes. This is a pragmatic
 * balance between RFC 5322 compliance and real-world usage.
 */

// More comprehensive email regex that:
// - Requires a TLD of at least 2 characters
// - Allows common special characters in local part (. + _ -)
// - Limits total length to 254 characters (per RFC 5321)
// - Limits local part to 64 characters (per RFC 5321)
// - Limits domain part to 255 characters (per RFC 5321)
const EMAIL_REGEX = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

/**
 * Validates an email address format.
 *
 * @param email - The email address to validate
 * @returns true if the email appears valid, false otherwise
 *
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('user.name+tag@example.co.uk') // true
 * isValidEmail('invalid') // false
 * isValidEmail('no@tld') // false
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();

  // Check length constraints
  if (trimmed.length < 6 || trimmed.length > 254) {
    return false;
  }

  // Check against regex
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Sanitizes an email address by trimming and lowercasing.
 *
 * @param email - The email address to sanitize
 * @returns The sanitized email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validates and sanitizes an email address.
 * Returns the sanitized email if valid, or null if invalid.
 *
 * @param email - The email address to validate and sanitize
 * @returns The sanitized email or null if invalid
 *
 * @example
 * validateAndSanitizeEmail('  User@Example.COM  ') // 'user@example.com'
 * validateAndSanitizeEmail('invalid') // null
 */
export function validateAndSanitizeEmail(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }
  return sanitizeEmail(email);
}
