// @ts-check

import { mean, median, percentile } from './stats.js';
import { InvalidInputError } from './errors.js';

// Response time measurement for the performance experiment (only the request itself without the login and the preparation).

/**
 * Sends one request and measures its time.
 * A network error is recorded as status `null`.
 *
 * @param {() => Promise<{ status: number }>} send - Request to send.
 * @returns {Promise<{ ms: number, status: number | null }>} The time and the HTTP status.
 */
export async function measure(send) {
  const start = performance.now();

  try {
    const { status } = await send();

    return { ms: performance.now() - start, status };
  } catch {
    return { ms: performance.now() - start, status: null };
  }
}

/**
 * Sends `count` requests in batches, the batches one after another.
 * `batchSize` 1 means sequential requests.
 * `count` must be a multiple of `batchSize`.
 *
 * @param {() => Promise<{ status: number }>} send - Request to send.
 * @param {number} count - The number of requests.
 * @param {number} batchSize - The number of requests sent at the same time.
 * @returns {Promise<{ results: Array<{ ms: number, status: number | null }>, totalMs: number }>} The measurements and the time of the whole series.
 * @throws {InvalidInputError} If `count` or `batchSize` is not a positive integer, or `count` is not a multiple of `batchSize`.
 */
export async function runSeries(send, count, batchSize) {
  if (
    !Number.isInteger(count) ||
    !Number.isInteger(batchSize) ||
    count < 1 ||
    batchSize < 1 ||
    count % batchSize !== 0
  ) {
    throw new InvalidInputError(
      `Count must be a positive multiple of batchSize, got count ${count} and batchSize ${batchSize}.`,
    );
  }

  const results = [];
  const start = performance.now();

  for (let sent = 0; sent < count; sent += batchSize) {
    const batch = Array.from({ length: batchSize }, () => measure(send));
    results.push(...(await Promise.all(batch)));
  }

  return { results, totalMs: performance.now() - start };
}

/**
 * Counts the numbers of a series for the table, the times are rounded to 0.1 ms.
 * The first `warmup` requests are left out of the mean, median and p95,
 * the total time and the errors are counted from all requests.
 *
 * @param {{ results: Array<{ ms: number, status: number | null }>, totalMs: number }} series - The measured series.
 * @param {number} warmup - The number of the first requests left out.
 * @returns {{ requests: number, totalMs: number, meanMs: number, medianMs: number, p95Ms: number, errors: number }} The numbers.
 */
export function summarize({ results, totalMs }, warmup) {
  const times = results.slice(warmup).map((result) => result.ms);
  const round = (/** @type {number} */ ms) => Math.round(ms * 10) / 10;

  return {
    requests: results.length,
    totalMs: round(totalMs),
    meanMs: round(mean(times)),
    medianMs: round(median(times)),
    p95Ms: round(percentile(times, 95)),
    // Network errors (status null) and answers that are not 2xx
    errors: results.filter(
      (result) =>
        result.status === null || result.status < 200 || result.status > 299,
    ).length,
  };
}
