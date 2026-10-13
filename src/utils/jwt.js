// @ts-check

import { InvalidInputError } from './errors.js';

const JWT_PARTS_COUNT = 3;
const SIGNATURE_TAIL_LENGTH = 3;
const FAKE_SIGNATURE_TAIL = 'AAA';

/**
 * Decodes the payload (the second part) of a JWT. The signature is not checked.
 *
 * @param {string} token - The JWT in the form `header.payload.signature`.
 * @returns {Record<string, any>} The decoded payload.
 * @throws {InvalidInputError} If the token does not have the required number of parts.
 */
export function decodeTokenPayload(token) {
  const parts = typeof token === 'string' ? token.split('.') : [];

  if (parts.length !== JWT_PARTS_COUNT) {
    throw new InvalidInputError(
      `Token must be a JWT with ${JWT_PARTS_COUNT} parts.`,
    );
  }

  // A JWT uses base64url: "-" and "_" are replaced back before atob()
  const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');

  return JSON.parse(atob(base64));
}

/**
 * Gets the basket id that Juice Shop puts into the token payload.
 *
 * @param {string} token - The JWT returned by the login.
 * @returns {number} The value of the `bid` field.
 */
export function getBasketIdFromToken(token) {
  return decodeTokenPayload(token).bid;
}

/**
 * Makes an invalid copy of a token by replacing the end of its signature.
 *
 * @param {string} token - A valid JWT.
 * @returns {string} The token with the end of the signature replaced.
 */
export function tamperToken(token) {
  return token.slice(0, -SIGNATURE_TAIL_LENGTH) + FAKE_SIGNATURE_TAIL;
}
