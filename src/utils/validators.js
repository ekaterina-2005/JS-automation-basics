import { InvalidInputError } from './errors.js';
import { randomUUID } from 'node:crypto';

/**
 * Validates whether the provided data is an array.
 *
 * @param {unknown} data - The argument to validate.
 * @throws {InvalidInputError} If the provided argument is not an array.
 */
export function isDataArray(data) {
  if (!Array.isArray(data)) {
    throw new InvalidInputError('Data argument must be a valid array.');
  }
}

/**
 * Creates an email that is unique for each call, so a test does not depend on users created earlier.
 *
 * @param {string} prefix - The text before the unique part.
 * @param {string} domain - The domain with the `@` sign.
 * @returns {string} The email in the form `<prefix><uuid><domain>`.
 * @throws {InvalidInputError} If the prefix is not a non-empty string or the domain does not start with `@`.
 */
export function createUniqueEmail(prefix, domain) {
  if (typeof prefix !== 'string' || prefix.trim() === '') {
    throw new InvalidInputError('Prefix argument must be a non-empty string.');
  }
  if (typeof domain !== 'string' || !domain.startsWith('@')) {
    throw new InvalidInputError(
      'Domain argument must be a string that starts with "@".',
    );
  }

  return `${prefix}${randomUUID()}${domain}`;
}
