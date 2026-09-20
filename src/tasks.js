import { DELAY_MS } from '../config/constants.js';

/**
 * Helper to artificially delay code execution.
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * HOF that wraps an async function with polling and exponential backoff.
 *
 * @param {Function} asyncFn - The original async function to execute.
 * @param {Function} conditionFn - Callback returning true if the result is satisfactory.
 * @param {number} maxAttempts - Maximum number of retries.
 * @returns {Function} A new async function that implements the polling logic.
 * @throws {Error} If the limit of `maxAttempts` has been reached, throws an Error with the last error.
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

/**
 * HOF that wraps an async function with a timeout arrangement.
 * If the original function does not return a response within the specified time,
 * the request is aborted and a timeout error is thrown.
 *
 * @param {Function} fetchFn - The original async function to execute (must accept an options object with a `signal` property).
 * @param {number} timeoutMs - The allowed time in milliseconds before aborting the request.
 * @returns {Function} A new async function that applies the timeout logic.
 * @throws {Error} If the request takes longer than `timeoutMs`, throws an Error with the message 'Request Timeout'.
 */
export function withTimeout(fetchFn, timeoutMs) {
  return async function (...args) {
    const controller = new AbortController();

    const timerId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const result = await fetchFn(...args, { signal: controller.signal });
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request Timeout', { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timerId);
    }
  };
}

/**
 * HOF that caches the results of an async function.
 * If called again with the same arguments within the Time-To-Live (TTL) period,
 * it returns the cached result without executing the original function.
 *
 * @param {Function} fetchFn - The original async function to execute.
 * @param {number} ttlMs - The Time-To-Live for the cache in milliseconds.
 * @returns {Function} A new async function that uses caching.
 */
export function withCache(fetchFn, ttlMs) {
  const cache = new Map();

  return async function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const cachedRecord = cache.get(key);
      const isExpired = now - cachedRecord.timestamp >= ttlMs;

      if (!isExpired) {
        return cachedRecord.data;
      }
    }

    const result = await fetchFn(...args);

    cache.set(key, {
      data: result,
      timestamp: now,
    });

    return result;
  };
}
