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
  if (typeof asyncFn !== 'function') {
    throw new TypeError('asyncFn must be a function.');
  }

  if (typeof conditionFn !== 'function') {
    throw new TypeError('conditionFn must be a function.');
  }

  if (!Number.isInteger(maxAttempts) || maxAttempts <= 0) {
    throw new TypeError('maxAttempts must be a positive number.');
  }

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
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `The limit of ${maxAttempts} attempts has been reached. Last error - ${
            lastError ? lastError.message : 'condition not met'
          }`,
        );
      }

      await delay(delayTime);
      delayTime *= 2;
    }
  };
}

/**
 * HOF that measures and logs the execution time of an async function.
 *
 * @param {Function} asyncFn - The original async function to execute.
 * @param {number} [threshold=0] - The threshold in milliseconds for the SLOW warning.
 * @returns {Function} A new async function with logging capabilities.
 */
export function withLogging(asyncFn, threshold = 0) {
  if (typeof asyncFn !== 'function') {
    throw new TypeError('asyncFn must be a function.');
  }

  if (typeof threshold !== 'number' || threshold < 0) {
    throw new TypeError('threshold must be a non-negative number.');
  }

  return async function (...args) {
    // eslint-disable-next-line no-console
    console.log(
      `[Call] The function was called with arguments: ${JSON.stringify(args)}.`,
    );
    const start = performance.now();
    try {
      const result = await asyncFn(...args);
      const time = performance.now() - start;
      // eslint-disable-next-line no-console
      console.log(`[Success] Operation completed, time: ${time.toFixed(0)}ms.`);

      if (threshold > 0 && time > threshold) {
        // eslint-disable-next-line no-console
        console.warn(
          `[SLOW] The request took ${time.toFixed(0)}ms, which is longer than the ${threshold}ms.`,
        );
      }

      return result;
    } catch (error) {
      const time = (performance.now() - start).toFixed(0);
      // eslint-disable-next-line no-console
      console.error(`[API Error] ${error.message}, time: ${time}ms.`);

      throw error;
    }
  };
}

/**
 * HOF that validates the HTTP response status.
 *
 * @param {Function} fetchFn - The original async function returning a raw Response.
 * @param {number[]} allowedStatuses - An array of allowed HTTP status codes.
 * @returns {Function} A new async function with validation.
 */
export function withValidation(fetchFn, allowedStatuses) {
  if (typeof fetchFn !== 'function') {
    throw new TypeError('fetchFn must be a function.');
  }

  if (!Array.isArray(allowedStatuses) || allowedStatuses.length === 0) {
    throw new TypeError('allowedStatuses must be a non-empty array.');
  }

  return async function (...args) {
    const response = await fetchFn(...args);
    const isAllowed = allowedStatuses.includes(response.status);

    if (isAllowed) {
      return await response.json();
    }

    const errorBody = await response.text();
    const statusText = response.statusText
      ? response.statusText.toLowerCase()
      : 'error';
    const errorMessage = `HTTP ${response.status}: ${errorBody.trim() || statusText}`;
    const error = new Error(errorMessage);
    Object.assign(error, { status: response.status });

    throw error;
  };
}

/**
 * HOF that wraps an async function with a timeout arrangement.
 * If the original function does not return a response within the specified time,
 * the request is aborted and a timeout error is thrown.
 *
 * @param {Function} fetchFn - The original async function to execute (must accept an options object for a new `signal` property as a second parameter).
 * @param {number} timeoutMs - The allowed time in milliseconds before aborting the request.
 * @returns {Function} A new async function that applies the timeout logic.
 * @throws {Error} If the request takes longer than `timeoutMs`, throws an Error with the message 'Request Timeout'.
 */
export function withTimeout(fetchFn, timeoutMs) {
  if (typeof fetchFn !== 'function') {
    throw new TypeError('fetchFn must be a function.');
  }

  if (typeof timeoutMs !== 'number' || timeoutMs <= 0) {
    throw new TypeError('timeoutMs must be a positive number.');
  }

  return async function (...args) {
    const controller = new AbortController();

    const timerId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const url = args[0];
    const options = args[1] || {};
    const mergedOptions = { ...options, signal: controller.signal };

    try {
      const result = await fetchFn(url, mergedOptions, ...args.slice(2));
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
  if (typeof fetchFn !== 'function') {
    throw new TypeError('fetchFn must be a function.');
  }

  if (typeof ttlMs !== 'number' || ttlMs <= 0) {
    throw new TypeError('ttlMs must be a positive number.');
  }

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
