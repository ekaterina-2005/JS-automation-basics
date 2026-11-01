// @ts-check

import { test as base, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { createUniqueEmail } from '../utils/validators.js';
import {
  JSON_CONTENT_TYPE,
  TEST_EMAIL_PREFIX,
  TEST_EMAIL_DOMAIN,
  TEST_USER_PASSWORD,
  OWASP_PRODUCTS_PAGE_URL,
  HTTP_STATUS,
} from '../../config/constants.js';
import { JuiceShopClient } from '../api/JuiceShopClient.js';

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

  // Registered through the API
  user: async ({ request }, use, testInfo) => {
    const api = new JuiceShopClient(request);
    // A new user for each test
    const user = {
      email: createUniqueEmail(TEST_EMAIL_PREFIX, TEST_EMAIL_DOMAIN),
      password: TEST_USER_PASSWORD,
    };

    const response = await api.register({
      ...user,
      passwordRepeat: user.password,
    });
    expect(response.status, 'User must be registered.').toBe(
      HTTP_STATUS.CREATED,
    );

    // The failure can be reproduced with the same data on one's own
    await testInfo.attach('User data', {
      body: JSON.stringify(user, null, 2),
      contentType: JSON_CONTENT_TYPE,
    });

    await use(user);
  },

  authenticatedPage: async ({ dismissedPage, user }, use) => {
    const loginPage = new LoginPage(dismissedPage);

    await loginPage.goToLogin();
    await loginPage.fillCredentials(user.email, user.password);
    await loginPage.login();
    await expect(dismissedPage).toHaveURL(OWASP_PRODUCTS_PAGE_URL);

    await use(dismissedPage);
  },
});

// Re-exported so that specs need a single import
export { expect };
