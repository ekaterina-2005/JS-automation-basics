// @ts-check

import { test, expect } from '../fixtures/index.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { BasketPage } from '../pages/BasketPage.js';
import {
  EMPTY_BASKET_PRICE,
  GUEST_BASKET_OWNER,
  OWASP_BASKET_PAGE_URL,
  OWASP_CURRENCY,
  TOTAL_PRICE_LABEL,
} from '../config/constants.js';

const NO_ROWS_COUNT = 0;
const ONE_ROW_COUNT = 1;
const BASKET_PRODUCT = 'Apple Juice (1000ml)';
const BASKET_PRODUCT_PRICE = `1.99${OWASP_CURRENCY}`;
const BASKET_PRODUCT_DOUBLE_PRICE = `3.98${OWASP_CURRENCY}`;
const SINGLE_QUANTITY = 1;
const DOUBLE_QUANTITY = 2;

/**
 * Puts the product into the basket the given number of times and waits for the basket counter after each click.
 *
 * @param {ProductsPage} productsPage - The page object of the opened All Products page.
 * @param {number} quantity - How many times the product is added, a positive integer.
 * @returns {Promise<void>} Resolves when the basket counter shows the quantity.
 * @throws {RangeError} If the quantity is not a positive integer.
 */
async function addProductToBasket(productsPage, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError('Quantity argument must be a positive integer.');
  }

  for (let count = 1; count <= quantity; count++) {
    await productsPage.addToBasket(BASKET_PRODUCT);
    await expect(
      productsPage.addedToBasketMessage(BASKET_PRODUCT),
    ).toBeVisible();
    await productsPage.closeSnackbar();
    await expect(productsPage.basketCounter).toHaveText(String(count));
    await expect(
      productsPage.addedToBasketMessage(BASKET_PRODUCT),
    ).toBeHidden();
  }
}

test.describe('Basket', () => {
  /** @type {ProductsPage} */
  let productsPage;
  /** @type {BasketPage} */
  let basketPage;

  test.beforeEach(async ({ dismissedPage }) => {
    productsPage = new ProductsPage(dismissedPage);
    basketPage = new BasketPage(dismissedPage);
  });

  test('Add a product to the basket and verify it in the basket', async ({
    dismissedPage,
  }) => {
    await test.step('Click "Add to Basket" on the product card', async () => {
      await productsPage.addToBasket(BASKET_PRODUCT);

      await expect(
        productsPage.addedToBasketMessage(BASKET_PRODUCT),
      ).toBeVisible();
      await expect(productsPage.basketCounter).toHaveText(
        String(SINGLE_QUANTITY),
      );
    });

    await productsPage.openBasket();

    await expect(dismissedPage).toHaveURL(OWASP_BASKET_PAGE_URL);
    await expect(basketPage.heading).toContainText(GUEST_BASKET_OWNER);
    await expect(basketPage.rows).toHaveCount(ONE_ROW_COUNT);
    await expect(
      basketPage.cell(BASKET_PRODUCT, String(SINGLE_QUANTITY)),
    ).toBeVisible();
    await expect(
      basketPage.cell(BASKET_PRODUCT, BASKET_PRODUCT_PRICE),
    ).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(
      `${TOTAL_PRICE_LABEL}${BASKET_PRODUCT_PRICE}`,
    );
  });

  test('Add the same product again: the quantity is summed', async () => {
    await addProductToBasket(productsPage, DOUBLE_QUANTITY);
    await productsPage.openBasket();

    await expect(basketPage.rows).toHaveCount(ONE_ROW_COUNT);
    await expect(
      basketPage.cell(BASKET_PRODUCT, String(DOUBLE_QUANTITY)),
    ).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(
      `${TOTAL_PRICE_LABEL}${BASKET_PRODUCT_DOUBLE_PRICE}`,
    );
  });

  test('Change the quantity with "-" and "+": not below 1', async () => {
    await addProductToBasket(productsPage, DOUBLE_QUANTITY);
    await productsPage.openBasket();

    await expect(
      basketPage.cell(BASKET_PRODUCT, String(DOUBLE_QUANTITY)),
    ).toBeVisible();

    await basketPage.decreaseQuantity(BASKET_PRODUCT);

    await expect(
      basketPage.cell(BASKET_PRODUCT, String(SINGLE_QUANTITY)),
    ).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(
      `${TOTAL_PRICE_LABEL}${BASKET_PRODUCT_PRICE}`,
    );

    await basketPage.decreaseQuantity(BASKET_PRODUCT);

    await expect(basketPage.rows).toHaveCount(ONE_ROW_COUNT);
    await expect(
      basketPage.cell(BASKET_PRODUCT, String(SINGLE_QUANTITY)),
    ).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(
      `${TOTAL_PRICE_LABEL}${BASKET_PRODUCT_PRICE}`,
    );

    await basketPage.increaseQuantity(BASKET_PRODUCT);

    await expect(
      basketPage.cell(BASKET_PRODUCT, String(DOUBLE_QUANTITY)),
    ).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(
      `${TOTAL_PRICE_LABEL}${BASKET_PRODUCT_DOUBLE_PRICE}`,
    );
  });

  test('Delete the product: the basket becomes empty', async () => {
    await addProductToBasket(productsPage, SINGLE_QUANTITY);
    await productsPage.openBasket();
    await expect(basketPage.rows).toHaveCount(ONE_ROW_COUNT);

    await basketPage.deleteProduct(BASKET_PRODUCT);

    await expect(basketPage.rows).toHaveCount(NO_ROWS_COUNT);
    await expect(basketPage.totalPrice).toHaveText(
      `${TOTAL_PRICE_LABEL}${EMPTY_BASKET_PRICE}`,
    );
    await expect(basketPage.checkoutButton).toBeDisabled();
  });
});
