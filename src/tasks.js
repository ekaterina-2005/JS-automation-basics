import { DELAY_MS } from '../config/constants.js';

/**
 * Helper to artificially delay code execution.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * HOF that wraps an async function with polling and exponential backoff.
 *
 * @param {Function} asyncFn - The async function to execute.
 * @param {Function} conditionFn - Callback returning true if the result is satisfactory.
 * @param {number} maxAttempts - Maximum number of retries.
 * @returns {Function} A new async function that implements the polling logic.
 */
export function pollUntilReady(asyncFn, conditionFn, maxAttempts) {
  return async function (...args) {
    let delayTime = DELAY_MS;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await asyncFn(...args);

        if (conditionFn(result) === true) {
          return result;
        }
      } catch (error) {
        lastError = error;

        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `The limit of ${maxAttempts} attempts has been reached. Last error: ${
            lastError ? lastError.message : 'Condition not met'
          }.`,
        );
      }

      await delay(delayTime);
      delayTime *= 2;
    }
  };
}
