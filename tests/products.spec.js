// @ts-check

import { test, expect } from '../fixtures/index.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import {
  OWASP_PRODUCTS_PAGE_URL,
  PRODUCT_PRICE_PATTERN,
} from '../config/constants.js';

const NO_CARDS_COUNT = 0;

test.describe('Products', () => {
  test('Product list is displayed', async ({ authenticatedPage }) => {
    const productsPage = new ProductsPage(authenticatedPage);

    await expect(authenticatedPage).toHaveURL(OWASP_PRODUCTS_PAGE_URL);
    await expect(productsPage.title).toBeVisible();
    await expect(productsPage.productCards).not.toHaveCount(NO_CARDS_COUNT);

    const cardsCount = await productsPage.productCards.count();

    await expect(
      productsPage.cardsWithPrice(PRODUCT_PRICE_PATTERN),
    ).toHaveCount(cardsCount);
    await expect(productsPage.cardsWithAddButton).toHaveCount(cardsCount);
  });
});
