import { InvalidInputError } from './errors.js';

/**
 * Gets the value of a cookie from the browser context by its name.
 *
 * @param {import('@playwright/test').BrowserContext} context - The browser context of the current test.
 * @param {string} name - The name of the cookie to find.
 * @returns {Promise<string | undefined>} The cookie value, or `undefined` if the cookie is not set.
 * @throws {InvalidInputError} If the context is missing or the name is not a non-empty string.
 */
export async function getCookieValue(context, name) {
  if (typeof context?.cookies !== 'function') {
    throw new InvalidInputError('Context argument must be a browser context.');
  }
  if (typeof name !== 'string' || name.trim() === '') {
    throw new InvalidInputError('Name argument must be a non-empty string.');
  }

  const cookies = await context.cookies();

  return cookies.find((cookie) => cookie.name === name)?.value;
}
