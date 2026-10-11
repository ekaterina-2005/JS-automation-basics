// @ts-check

import { test, expect } from '../fixtures/index.js';
import { LoginPage } from '../pages/LoginPage.js';
import { getCookieValue } from '../src/utils/cookies.js';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  INVALID_CREDENTIALS,
  MASKED_INPUT_TYPE,
  OWASP_LOGIN_PAGE_URL,
  OWASP_PRODUCTS_PAGE_URL,
  TOKEN_COOKIE,
} from '../config/constants.js';

const EMPTY_VALUE = '';

test.describe('Login', () => {
  /** @type {LoginPage} */
  let loginPage;

  test.beforeEach(async ({ dismissedPage }) => {
    loginPage = new LoginPage(dismissedPage);

    await loginPage.goToLogin();
    await expect(dismissedPage).toHaveURL(OWASP_LOGIN_PAGE_URL);
  });

  for (const { title, email, password } of INVALID_CREDENTIALS) {
    test(`Login with invalid credentials: ${title}`, async ({
      dismissedPage,
      context,
    }) => {
      await loginPage.fillCredentials(email, password);
      await loginPage.login();

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(dismissedPage).toHaveURL(OWASP_LOGIN_PAGE_URL);
      expect(await getCookieValue(context, TOKEN_COOKIE)).toBeUndefined();
    });
  }

  test('"Log in" button state for empty / filled fields', async () => {
    await test.step('Email and password are empty', async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step('Only email is filled', async () => {
      await loginPage.fillCredentials(ADMIN_EMAIL, EMPTY_VALUE);

      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step('Only password is filled', async () => {
      await loginPage.fillCredentials(EMPTY_VALUE, ADMIN_PASSWORD);

      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step('Email and password are filled', async () => {
      await loginPage.fillCredentials(ADMIN_EMAIL, ADMIN_PASSWORD);

      await expect(loginPage.loginButton).toBeEnabled();
    });
  });

  test('Login with valid email and password, then logout', async ({
    dismissedPage,
    context,
  }) => {
    await loginPage.fillEmail(ADMIN_EMAIL);

    await expect(loginPage.emailInput).toHaveValue(ADMIN_EMAIL);

    await loginPage.fillPassword(ADMIN_PASSWORD);

    await expect(loginPage.passwordInput).toHaveValue(ADMIN_PASSWORD);
    await expect(loginPage.passwordInput).toHaveAttribute(
      'type',
      MASKED_INPUT_TYPE,
    );

    await loginPage.login();

    await expect(dismissedPage).toHaveURL(OWASP_PRODUCTS_PAGE_URL);
    await expect
      .poll(() => getCookieValue(context, TOKEN_COOKIE))
      .toBeDefined();

    await loginPage.openAccountMenu();

    await expect(loginPage.logoutMenuItem).toBeVisible();

    await loginPage.selectLogoutMenuItem();

    await expect
      .poll(() => getCookieValue(context, TOKEN_COOKIE))
      .toBeUndefined();

    await loginPage.openAccountMenu();

    await expect(loginPage.logoutMenuItem).toBeHidden();
    await expect(loginPage.loginMenuItem).toBeVisible();
  });
});
