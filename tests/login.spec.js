// @ts-check

import { test, expect } from '../fixtures/index.js';
import { LoginPage } from '../pages/LoginPage.js';

// Built-in Juice Shop user, it exists right after the container starts.
// The tests do not change user data.
const EMAIL = 'admin@juice-sh.op';
const PASSWORD = 'admin123';

test.describe('Login', () => {
  /** @type {LoginPage} */
  let loginPage;

  test.beforeEach(async ({ dismissedPage }) => {
    loginPage = new LoginPage(dismissedPage);

    await loginPage.goToLogin();
    await expect(dismissedPage).toHaveURL(/\/#\/login/);
  });

  test('Login with valid email', async ({ dismissedPage }) => {
    await loginPage.fillCredentials(EMAIL, PASSWORD);
    await loginPage.login();

    await expect(dismissedPage).toHaveURL(/\/#\/search/);
  });

  test('Login with wrong password', async ({ dismissedPage }) => {
    await loginPage.fillCredentials(EMAIL, 'WrongPass123!');
    await loginPage.login();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(dismissedPage).toHaveURL(/\/#\/login/);
  });

  test('Login with empty email', async () => {
    await loginPage.fillCredentials('', PASSWORD);

    await expect(loginPage.loginButton).toBeDisabled();
  });
});
