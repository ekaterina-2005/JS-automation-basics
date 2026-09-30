// @ts-check

import { test, expect } from '@playwright/test';

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
    const welcomeTitle = page.getByRole('heading', {
      name: 'Welcome to OWASP Juice Shop!',
    });
    const closeWelcomeButton = page.getByRole('button', {
      name: 'Close Welcome Banner',
    });
    const cookieBannerText = page.getByText(
      'This website uses fruit cookies to ensure you get the juiciest tracking experience.',
    );
    const acceptCookiesButton = page.getByRole('button', {
      name: 'dismiss cookie message',
    });

    await page.goto('http://localhost:3000');
    await expect(welcomeTitle).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(welcomeTitle).toBeHidden();
    expect(
      await getCookieValue(context, 'welcomebanner_status'),
    ).toBeUndefined();

    await page.reload();
    await expect(welcomeTitle).toBeVisible();

    await closeWelcomeButton.click();
    await expect(welcomeTitle).toBeHidden();
    await expect
      .poll(() => getCookieValue(context, 'welcomebanner_status'))
      .toBe('dismiss');
    await expect(cookieBannerText).toBeVisible();

    await page.reload();
    await expect(cookieBannerText).toBeVisible();
    expect(
      await getCookieValue(context, 'cookieconsent_status'),
    ).toBeUndefined();

    await acceptCookiesButton.click();
    await expect(cookieBannerText).toBeHidden();
    await expect
      .poll(() => getCookieValue(context, 'cookieconsent_status'))
      .toBe('dismiss');

    await page.reload();
    await expect(welcomeTitle).toBeHidden();
    await expect(cookieBannerText).toBeHidden();
    await page.getByRole('button', { name: 'Open Sidenav' }).click();
    await expect(
      page.getByRole('heading', { name: 'OWASP Juice Shop' }),
    ).toBeVisible();
  });
});
