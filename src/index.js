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
import { pollUntilReady } from './tasks.js';

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
 * @param {string} url - The URL to fetch.
 * @returns {Promise<any>}
 */
async function fetchTestUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return response.json();
}

const smartFetch = pollUntilReady(fetchTestUrl, () => true, ATTEMPTS);

await assert.doesNotReject(async () => {
  await smartFetch(DELAY_FETCH_URL);
}, 'smartFetch should wait for 3 seconds and successfully return data without throwing');

await assert.rejects(
  async () => {
    await smartFetch(FALSE_FETCH_URL);
  },
  Error,
  'smartFetch should throw an error after max attempts.',
);
