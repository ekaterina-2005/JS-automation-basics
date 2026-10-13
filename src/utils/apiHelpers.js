// @ts-check

import { test, expect } from '@playwright/test';
import { JSON_CONTENT_TYPE } from '../../config/constants.js';

/**
 * Builds the body of POST for basket items.
 *
 * @param {number | string} productId - The product id.
 * @param {number | string} basketId - The basket id.
 * @param {unknown} [quantity=1] - The quantity. Any type, so negative checks can send wrong values.
 * @returns {{ ProductId: number | string, BasketId: string, quantity: unknown }} The basket item data.
 */
export function buildBasketItem(productId, basketId, quantity = 1) {
  return { ProductId: productId, BasketId: String(basketId), quantity };
}

/**
 * Checks that the status is a client error (4xx): the request is rejected, and the server does not fail.
 *
 * @param {number} status - The HTTP status of the response.
 */
export function expectClientError(status) {
  expect(status, 'Status must be 4xx').toBeGreaterThanOrEqual(400);
  expect(status, 'Status must be 4xx').toBeLessThan(500);
}

/**
 * Checks that the server did not fail with a 5xx status.
 *
 * @param {number} status - The HTTP status of the response.
 */
export function expectNoServerError(status) {
  expect(status, 'Status must not be 5xx').toBeLessThan(500);
}

/**
 * Attaches the response to the test report, so the actual behavior is recorded even when the test passes (test.fail()).
 *
 * @param {string} name - The name of the attachment.
 * @param {{ status: number, body: unknown }} response - The response to record.
 * @returns {Promise<void>} Resolves when the attachment is added.
 */
export async function attachResponse(name, response) {
  await test.info().attach(name, {
    body: JSON.stringify(response, null, 2),
    contentType: JSON_CONTENT_TYPE,
  });
}
