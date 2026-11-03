// @ts-check

import { InvalidInputError } from '../utils/errors.js';

// Statistics for the performance experiment

/**
 * Checks that there are values to count.
 *
 * @param {number[]} values - The values.
 * @throws {InvalidInputError} If the array is empty.
 */
function assertNotEmpty(values) {
  if (values.length === 0) {
    throw new InvalidInputError('Values must not be empty.');
  }
}

/**
 * Sorts a copy of the values in ascending order. The original array is not changed.
 *
 * @param {number[]} values - The values.
 * @returns {number[]} The sorted copy.
 */
function sortedCopy(values) {
  return [...values].sort((a, b) => a - b);
}

/**
 * The arithmetic mean: the sum divided by the number of values.
 *
 * @param {number[]} values - The values.
 * @returns {number} The mean.
 */
export function mean(values) {
  assertNotEmpty(values);

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * The median: the middle value of the sorted values.
 * For an even number of values it is the mean of the two middle values.
 *
 * @param {number[]} values - The values.
 * @returns {number} The median.
 */
export function median(values) {
  assertNotEmpty(values);
  const sorted = sortedCopy(values);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * The percentile by the nearest-rank method:
 * the smallest value that is not less than `p` percent of the values.
 * pN = N% of the requests were not slower than this value.
 *
 * @param {number[]} values - The values.
 * @param {number} p - The percentile (from 1 to 100).
 * @returns {number} The value of the percentile.
 */
export function percentile(values, p) {
  assertNotEmpty(values);
  const sorted = sortedCopy(values);
  const rank = Math.ceil((p / 100) * sorted.length);

  return sorted[Math.max(rank, 1) - 1];
}
