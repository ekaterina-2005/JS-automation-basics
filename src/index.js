// @ts-check

import 'dotenv/config';
import assert from 'node:assert';
import {
  BACKEND_DATA,
  FILTER_STATUS,
  RAW_CONFIG,
  EXPECTED_CONFIG,
  USERS_ID,
  DELAY_FETCH_URL,
  FALSE_FETCH_URL,
  ATTEMPTS,
  DELAY_MS,
  TIMEOUT_MS,
  CACHE_TTL,
  USER_URL,
  ALLOWED_STATUSES,
} from '../config/constants.js';
import {
  filterOldSchool,
  transformOldSchool,
  aggregateOldSchool,
} from './utils/oldSchoolMethods.js';
import {
  filterModern,
  transformModern,
  aggregateModern,
} from './utils/modernMethods.js';
import { normalizeConfig } from './utils/configNormalizer.js';
import { ReqResClient } from './ReqResClient.js';
import {
  pollUntilReady,
  withLogging,
  withValidation,
  withTimeout,
  withCache,
} from './tasks.js';

// Sprint #1
assert.deepStrictEqual(
  filterOldSchool(BACKEND_DATA, FILTER_STATUS),
  filterModern(BACKEND_DATA, FILTER_STATUS),
  'Filter mismatch: The results of the for-loop and array.filter() are not equal.',
);

assert.deepStrictEqual(
  transformOldSchool(BACKEND_DATA),
  transformModern(BACKEND_DATA),
  'Transform mismatch: The results of the for-loop and array.map() are not equal.',
);

assert.strictEqual(
  aggregateOldSchool(BACKEND_DATA),
  aggregateModern(BACKEND_DATA),
  'Aggregate mismatch: The results of the for-loop and array.reduce() are not equal.',
);

assert.deepStrictEqual(
  normalizeConfig(RAW_CONFIG),
  EXPECTED_CONFIG,
  'Normalized config object does not match the expected structure or default values.',
);

// Sprint #2
const reqResClient = new ReqResClient();
const promises = USERS_ID.map((id) => reqResClient.getUser(id));
const responses = await Promise.all(promises);

const emails = responses.map((response) => {
  return response?.data?.email ?? null;
});

assert(Array.isArray(emails), 'Extracted emails result must be an array.');

assert.strictEqual(
  emails.length,
  USERS_ID.length,
  `The length of the emails array must be exactly ${USERS_ID.length}.`,
);

/**
 * Generic fetch helper to test arbitrary URLs.
 *
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options={}] - Additional options that can be added by HOF.
 * @returns {Promise<any>}
 */
async function fetchTestUrl(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return response.json();
}

const fetchWithPollUntilReady = pollUntilReady(
  fetchTestUrl,
  () => true,
  ATTEMPTS,
);

await assert.doesNotReject(
  async () => {
    await fetchWithPollUntilReady(DELAY_FETCH_URL);
  },
  `fetchWithPollUntilReady should wait for ${Math.floor(DELAY_MS / 1000)} seconds and successfully return data without throwing`,
);

await assert.rejects(
  async () => {
    await fetchWithPollUntilReady(FALSE_FETCH_URL);
  },
  Error,
  `fetchWithPollUntilReady should throw an error after ${ATTEMPTS} attempts.`,
);

const fetchWithTimeout = withTimeout(fetchTestUrl, TIMEOUT_MS);

// The delay in DELAY_FETCH_URL must be more than TIMEOUT_MS
await assert.rejects(
  async () => {
    await fetchWithTimeout(DELAY_FETCH_URL);
  },
  new Error('Request Timeout'),
  'fetchWithTimeout should throw a Request Timeout error when the server takes too long.',
);

const fetchWithCache = withCache(fetchTestUrl, CACHE_TTL);

const firstStart = performance.now();
const firstData = await fetchWithCache(USER_URL);
const firstTime = performance.now() - firstStart;

const secondStart = performance.now();
const secondData = await fetchWithCache(USER_URL);
const secondTime = performance.now() - secondStart;

assert.deepStrictEqual(
  firstData,
  secondData,
  'Cached data must be identical to fetched data.',
);

assert(
  firstTime > secondTime,
  'The cached response should be significantly faster than the network response.',
);

/**
 * Raw fetch wrapper to pass into HOFs.
 *
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options={}] - Additional options that can be added by HOF.
 * @returns {Promise<Response>}
 */
async function rawFetch(url, options = {}) {
  return fetch(url, options);
}

/**
 * The key difference between the tests below lies in the order of HOF composition.
 * Placing logging outside the polling decorator logs only the final outcome once.
 * Wrapping logging inside the polling decorator triggers a log for each retry attempt.
 */
// withValidation -> withLogging -> pollUntilReady
const fetchWithValidation = withValidation(rawFetch, ALLOWED_STATUSES);
const fetchWithPolling = pollUntilReady(
  fetchWithValidation,
  () => true,
  ATTEMPTS,
);
const superFetch = withLogging(fetchWithPolling);

await assert.doesNotReject(async () => {
  const data = await superFetch(USER_URL);
  assert(data, 'superFetch must return parsed JSON data on success.');
}, 'superFetch must successfully fetch and validate valid URLs.');

await assert.rejects(async () => {
  await superFetch(FALSE_FETCH_URL);
}, `superFetch must throw an error on 500 status after ${ATTEMPTS} attempts.`);

// withValidation -> pollUntilReady -> withLogging
const fetchWithValidation2 = withValidation(rawFetch, ALLOWED_STATUSES);
const fetchWithLogging = withLogging(fetchWithValidation2);
const superFetchInverted = pollUntilReady(
  fetchWithLogging,
  () => true,
  ATTEMPTS,
);

await assert.doesNotReject(async () => {
  const data = await superFetchInverted(USER_URL);
  assert(data, 'superFetchInverted must return parsed JSON data on success.');
}, 'superFetchInverted must successfully fetch valid URLs.');

await assert.rejects(async () => {
  await superFetchInverted(FALSE_FETCH_URL);
}, `superFetchInverted must throw an error on 500 status after ${ATTEMPTS} attempts.`);
