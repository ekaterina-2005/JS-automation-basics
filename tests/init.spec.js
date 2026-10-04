// @ts-check

import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage.js';

/**
 * Gets the value of a cookie from the browser context by its name.
 *
 * @param {import('@playwright/test').BrowserContext} context - The browser context of the current test.
 * @param {string} name - The name of the cookie to find.
 * @returns {Promise<string | undefined>} The cookie value, or `undefined` if the cookie is not set.
 */
async function getCookieValue(context, name) {
  const cookies = await context.cookies();

  return cookies.find((cookie) => cookie.name === name)?.value;
}

test.describe('Init (Popups)', () => {
  test('Popups are shown again until confirmed and are not shown after being dismissed', async ({
    page,
    context,
  }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.open();
    await expect(productsPage.welcomeTitle).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(productsPage.welcomeTitle).toBeHidden();
    expect(
      await getCookieValue(context, 'welcomebanner_status'),
    ).toBeUndefined();

    await page.reload();
    await expect(productsPage.welcomeTitle).toBeVisible();

    await productsPage.closeWelcomeButton.click();
    await expect(productsPage.welcomeTitle).toBeHidden();
    await expect
      .poll(() => getCookieValue(context, 'welcomebanner_status'))
      .toBe('dismiss');
    await expect(productsPage.cookieBannerText).toBeVisible();

    await page.reload();
    await expect(productsPage.cookieBannerText).toBeVisible();
    expect(
      await getCookieValue(context, 'cookieconsent_status'),
    ).toBeUndefined();

    await productsPage.acceptCookiesButton.click();
    await expect(productsPage.cookieBannerText).toBeHidden();
    await expect
      .poll(() => getCookieValue(context, 'cookieconsent_status'))
      .toBe('dismiss');

    await page.reload();
    await expect(productsPage.welcomeTitle).toBeHidden();
    await expect(productsPage.cookieBannerText).toBeHidden();
    await expect(productsPage.basketCounter).toHaveText('0');
    await productsPage.openSidenav();
    await expect(productsPage.sidenavTitle).toBeVisible();
  });
});
