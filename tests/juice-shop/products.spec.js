// @ts-check

import { test, expect } from '@playwright/test';

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Close Welcome Banner' }).click();
    await page.getByRole('button', { name: 'dismiss cookie message' }).click();
  });

  test('Add a product to the basket and verify it in the basket', async ({
    page,
  }) => {
    const basketButton = page.getByRole('button', {
      name: 'Show the shopping cart',
    });
    const product = page.locator('mat-card').filter({ hasText: 'Apple Juice' });

    await product.getByRole('button', { name: 'Add to Basket' }).click();

    /*
     * A hard wait like page.waitForTimeout(3000) is fragile here. It does not check that the product
     * was actually added, so a failure shows up later in another place.
     * Instead, expect() retries until the snackbar and the basket counter are updated and continues
     * as soon as they are.
     */
    await expect(
      page.getByText('Placed Apple Juice (1000ml) into basket.'),
    ).toBeVisible();
    await expect(basketButton.locator('.fa-layers-counter')).toHaveText('1');

    await basketButton.click();

    await expect(page).toHaveURL(/\/#\/basket/);
    await expect(
      page.getByRole('heading', { name: 'Your Basket' }),
    ).toContainText('(anonymous)');
    const rows = page.locator('mat-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Apple Juice (1000ml)');
    await expect(rows.first().locator('span.cell-initial-font')).toHaveText(
      '1',
    );
    await expect(rows.first()).toContainText('1.99¤');
    await expect(page.locator('#price')).toHaveText('Total Price: 1.99¤');
  });
});
