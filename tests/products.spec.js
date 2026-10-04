// @ts-check

import { test, expect } from '../fixtures/index.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { BasketPage } from '../pages/BasketPage.js';

const PRODUCT = 'Apple Juice (1000ml)';
const PRICE = '1.99¤';

test.describe('Products', () => {
  test('Add a product to the basket and verify it in the basket', async ({
    dismissedPage,
  }) => {
    const productsPage = new ProductsPage(dismissedPage);
    const basketPage = new BasketPage(dismissedPage);

    await productsPage.addToBasket(PRODUCT);

    /*
     * A hard wait like page.waitForTimeout(3000) is fragile here. It does not check that the product
     * was actually added, so a failure shows up later in another place.
     * Instead, expect() retries until the snackbar and the basket counter are updated and continues
     * as soon as they are.
     */
    await expect(productsPage.addedToBasketMessage(PRODUCT)).toBeVisible();
    await expect(productsPage.basketCounter).toHaveText('1');

    await productsPage.openBasket();

    await expect(dismissedPage).toHaveURL(/\/#\/basket/);
    await expect(basketPage.heading).toContainText('(anonymous)');
    await expect(basketPage.rows).toHaveCount(1);
    await expect(basketPage.cell(PRODUCT, '1')).toBeVisible();
    await expect(basketPage.cell(PRODUCT, PRICE)).toBeVisible();
    await expect(basketPage.totalPrice).toHaveText(`Total Price: ${PRICE}`);
  });
});
