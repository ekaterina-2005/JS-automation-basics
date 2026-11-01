// @ts-check

import { createUniqueEmail } from '../utils/validators.js';
import {
  TEST_EMAIL_DOMAIN,
  TEST_EMAIL_PREFIX,
  TEST_USER_PASSWORD,
} from '../../config/constants.js';

/**
 * @typedef {object} UserData
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 */

/**
 * Builds the data of a new test user. The email is unique for each call.
 *
 * @param {Partial<UserData>} [overrides={}] - Additional user fields that matter for the scenario.
 * @returns {UserData} The user data.
 */
export function buildUser(overrides = {}) {
  return {
    email: createUniqueEmail(TEST_EMAIL_PREFIX, TEST_EMAIL_DOMAIN),
    password: TEST_USER_PASSWORD,
    ...overrides,
  };
}
