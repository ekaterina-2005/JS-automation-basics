// @ts-check

import { test, expect } from '../../fixtures/api.js';
import { loginSchema } from '../../schemas/auth.schema.js';
import {
  expectClientError,
  expectToMatchSchema,
} from '../../src/utils/apiHelpers.js';
import { getBasketIdFromToken } from '../../src/utils/jwt.js';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  HTTP_STATUS,
  LOGIN_ERROR_TEXT,
  UNREGISTERED_EMAIL,
  WRONG_PASSWORD,
} from '../../config/constants.js';

const EMPTY_VALUE = '';
// Marks the data sets where any 4xx status is accepted
const CLIENT_ERROR = '4xx';

/**
 * Data-driven login: one parameterized test runs over all these data sets.
 * The built-in admin of Juice Shop is used, it exists right after the container starts.
 */
const LOGIN_DATA = [
  {
    title: 'Login with valid credentials',
    credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    status: HTTP_STATUS.OK,
    hasToken: true,
  },
  {
    title: 'Login with a wrong password',
    credentials: { email: ADMIN_EMAIL, password: WRONG_PASSWORD },
    status: HTTP_STATUS.UNAUTHORIZED,
    errorText: LOGIN_ERROR_TEXT,
  },
  {
    title: 'Login with a non-existing email',
    credentials: { email: UNREGISTERED_EMAIL, password: ADMIN_PASSWORD },
    status: HTTP_STATUS.UNAUTHORIZED,
    errorText: LOGIN_ERROR_TEXT,
  },
  {
    title: 'Login with empty email and password',
    credentials: { email: EMPTY_VALUE, password: EMPTY_VALUE },
    status: HTTP_STATUS.UNAUTHORIZED,
  },
  {
    title: 'Login with an empty password',
    credentials: { email: ADMIN_EMAIL, password: EMPTY_VALUE },
    status: HTTP_STATUS.UNAUTHORIZED,
  },
  {
    title: 'Login with an empty email',
    credentials: { email: EMPTY_VALUE, password: ADMIN_PASSWORD },
    status: HTTP_STATUS.UNAUTHORIZED,
  },
  {
    title: 'Login without the password field',
    credentials: { email: ADMIN_EMAIL },
    status: CLIENT_ERROR,
  },
  {
    title: 'Login with empty credentials',
    credentials: {},
    status: CLIENT_ERROR,
  },
];

test.describe('Login API', () => {
  for (const {
    title,
    credentials,
    status,
    hasToken = false,
    errorText,
  } of LOGIN_DATA) {
    test(title, async ({ api }) => {
      const response = await api.login(credentials);

      if (status === CLIENT_ERROR) {
        expectClientError(response.status);
      } else {
        expect(response.status).toBe(status);
      }

      if (hasToken) {
        expect(response.body.authentication.token).toBeTruthy();
      } else {
        // A failed login answers with plain text, the whole body is checked as a string
        expect(JSON.stringify(response.body)).not.toContain('token');
      }

      if (errorText) {
        expect(response.body).toBe(errorText);
      }
    });
  }

  test('Login response has the token, the basket id and the email', async ({
    api,
  }) => {
    const response = await api.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expectToMatchSchema(loginSchema, response.body);

    const { token, bid, umail } = response.body.authentication;
    expect(umail).toBe(ADMIN_EMAIL);
    expect(
      getBasketIdFromToken(token),
      'bid must be in the token payload.',
    ).toBe(bid);
  });
});
