// @ts-check

import { test as base, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegistrationPage } from '../pages/RegistrationPage.js';
import { createUniqueEmail } from '../src/utils/validators.js';
import {
  TEST_EMAIL_PREFIX,
  TEST_EMAIL_DOMAIN,
  TEST_USER_PASSWORD,
  TEST_SECURITY_ANSWER,
  OWASP_LOGIN_PAGE_URL,
  OWASP_PRODUCTS_PAGE_URL,
} from '../config/constants.js';

/**
 * @typedef {object} User
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 */
/**
 * @typedef {object} Fixtures
 * @property {import('@playwright/test').Page} dismissedPage - The start page with both popups dismissed.
 * @property {User} user - A new registered user, unique for each test.
 * @property {import('@playwright/test').Page} authenticatedPage - The page where `user` is logged in.
 */
export const test = /** @type {typeof base.extend<Fixtures>} */ (base.extend)({
  dismissedPage: async ({ page }, use) => {
    const basePage = new BasePage(page);

    await basePage.open();
    await basePage.dismissPopups();

    await use(page);
  },

  user: async ({ dismissedPage }, use) => {
    const loginPage = new LoginPage(dismissedPage);
    const registrationPage = new RegistrationPage(dismissedPage);
    // A new user for each test
    const user = {
      email: createUniqueEmail(TEST_EMAIL_PREFIX, TEST_EMAIL_DOMAIN),
      password: TEST_USER_PASSWORD,
    };

    await loginPage.goToLogin();
    await loginPage.goToRegistration();
    await registrationPage.fillForm({
      ...user,
      securityAnswer: TEST_SECURITY_ANSWER,
    });
    await registrationPage.register();
    await expect(registrationPage.successMessage).toBeVisible();
    await expect(dismissedPage).toHaveURL(OWASP_LOGIN_PAGE_URL);

    await use(user);
  },

  authenticatedPage: async ({ dismissedPage, user }, use) => {
    const loginPage = new LoginPage(dismissedPage);

    // After the registration the app is already on the Login page
    await loginPage.fillCredentials(user.email, user.password);
    await loginPage.login();
    await expect(dismissedPage).toHaveURL(OWASP_PRODUCTS_PAGE_URL);

    await use(dismissedPage);
  },
});

// Re-exported so that specs need a single import.
export { expect };
