// @ts-check

import { test, expect } from '../fixtures/index.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { BasketPage } from '../pages/BasketPage.js';

const PRODUCT = 'Apple Juice (1000ml)';
const PRICE = '1.99¤';

test.describe('Basket', () => {
  test('Add the same product again: the quantity is summed', async ({
    dismissedPage,
  }) => {
    const productsPage = new ProductsPage(dismissedPage);
    const basketPage = new BasketPage(dismissedPage);

    // The test prepares its own state: the first click puts 1 x product into the empty guest basket
    await productsPage.addToBasket(PRODUCT);
    await expect(productsPage.basketCounter).toHaveText('1');

    await productsPage.addToBasket(PRODUCT);
    await expect(productsPage.basketCounter).toHaveText('2');

    await productsPage.openBasket();

    await expect(basketPage.rows).toHaveCount(1);
    await expect(basketPage.cell(PRODUCT, '2')).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText('Total Price: 3.98¤');
  });

  test('Logged-in user adds a product and sees it in the own basket', async ({
    authenticatedPage,
    user,
  }) => {
    const productsPage = new ProductsPage(authenticatedPage);
    const basketPage = new BasketPage(authenticatedPage);

    await productsPage.addToBasket(PRODUCT);
    await expect(productsPage.addedToBasketMessage(PRODUCT)).toBeVisible();
    await expect(productsPage.basketCounter).toHaveText('1');

    await productsPage.openBasket();

    await expect(authenticatedPage).toHaveURL(/\/#\/basket/);
    await expect(basketPage.heading).toContainText(user.email);
    await expect(basketPage.rows).toHaveCount(1);
    await expect(basketPage.cell(PRODUCT, '1')).toBeVisible();
    await expect(basketPage.cell(PRODUCT, PRICE)).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(`Total Price: ${PRICE}`);
  });
});
