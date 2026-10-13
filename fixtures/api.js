// @ts-check

import { test as base, expect } from '@playwright/test';
import { JuiceShopClient } from '../src/JuiceShopClient.js';
import { buildBasketItem } from '../src/utils/apiHelpers.js';
import { createUniqueEmail } from '../src/utils/validators.js';
import { getBasketIdFromToken } from '../src/utils/jwt.js';
import {
  SEARCH_QUERY,
  SEARCHED_ITEM_NAME,
  HTTP_STATUS,
  TEST_EMAIL_DOMAIN,
  TEST_EMAIL_PREFIX,
  TEST_USER_PASSWORD,
} from '../config/constants.js';

/**
 * @typedef {object} ApiUser
 * @property {number} id - The user id.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {string} token - The JWT of the logged-in user.
 * @property {number} basketId - The basket id taken from the token.
 */
/**
 * @typedef {object} Product
 * @property {number} id - The product id.
 * @property {string} name - The product name.
 */
/**
 * @typedef {object} BasketItem
 * @property {number} id - The basket item id, needed to change or delete the item.
 * @property {number} ProductId - The product id.
 * @property {number} quantity - The quantity.
 */
/**
 * @typedef {object} ApiFixtures
 * @property {JuiceShopClient} api - The JuiceShopClient object with `baseURL` from playwright.config.js.
 * @property {ApiUser} user - A new registered and logged-in user, unique for each test.
 * @property {ApiUser} otherUser - A second new user, the owner of "another" basket.
 * @property {Product} product - The product found by the search.
 * @property {BasketItem} basketItem - The product put into the basket of `user`, deleted after the test.
 */
/**
 * Registers a new user and logs in.
 *
 * @param {JuiceShopClient} api - The JuiceShopClient object.
 * @returns {Promise<ApiUser>} The new user with the token and the basket id.
 */
async function registerUser(api) {
  const email = createUniqueEmail(TEST_EMAIL_PREFIX, TEST_EMAIL_DOMAIN);
  const registration = await api.register({
    email,
    password: TEST_USER_PASSWORD,
    passwordRepeat: TEST_USER_PASSWORD,
  });
  expect(registration.status, 'User must be registered.').toBe(
    HTTP_STATUS.CREATED,
  );

  const token = await api.getToken(email, TEST_USER_PASSWORD);

  return {
    id: registration.body.data.id,
    email,
    password: TEST_USER_PASSWORD,
    token,
    basketId: getBasketIdFromToken(token),
  };
}

export const test = /** @type {typeof base.extend<ApiFixtures>} */ (
  base.extend
)({
  api: async ({ baseURL }, use) => {
    await use(new JuiceShopClient(baseURL));
  },

  // A new user for each test: first user
  user: async ({ api }, use) => {
    await use(await registerUser(api));
  },

  // A new user for each test: second user
  otherUser: async ({ api }, use) => {
    await use(await registerUser(api));
  },

  product: async ({ api }, use) => {
    const response = await api.searchProducts(SEARCH_QUERY);
    const found = response.body.data.find(
      (/** @type {Product} */ item) => item.name === SEARCHED_ITEM_NAME,
    );
    expect(found, `${SEARCHED_ITEM_NAME} must be found.`).toBeDefined();

    await use(found);
  },

  basketItem: async ({ api, user, product }, use) => {
    const response = await api.addToBasket(
      user.token,
      buildBasketItem(product.id, user.basketId),
    );
    expect(response.status, 'Product must be added to the basket.').toBe(
      HTTP_STATUS.OK,
    );

    await use(response.body.data);

    // Teardown: a test may have deleted the item already, so the status is not checked
    await api.deleteBasketItem(user.token, response.body.data.id);
  },
});

// Re-exported so that specs need a single import
export { expect };
