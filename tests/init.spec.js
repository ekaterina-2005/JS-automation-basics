// @ts-check

import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage.js';
import { KEYS } from '../config/keycodes.js';
import {
  COOKIE_CONSENT_COOKIE,
  DISMISSED_COOKIE_VALUE,
  WELCOME_BANNER_COOKIE,
} from '../config/constants.js';
import { getCookieValue } from '../src/utils/cookies.js';

const EMPTY_BASKET_COUNT = '0';

test.describe('Init (Popups)', () => {
  test('Popups are shown again until confirmed and are not shown after being dismissed', async ({
    page,
    context,
  }) => {
    const basePage = new BasePage(page);

    await basePage.open();
    await expect(basePage.welcomeTitle).toBeVisible();

    await page.keyboard.press(KEYS.ESCAPE);
    await expect(basePage.welcomeTitle).toBeHidden();
    expect(
      await getCookieValue(context, WELCOME_BANNER_COOKIE),
    ).toBeUndefined();

    await page.reload();
    await expect(basePage.welcomeTitle).toBeVisible();

    await basePage.closeWelcomeBanner();
    await expect(basePage.welcomeTitle).toBeHidden();
    await expect
      .poll(() => getCookieValue(context, WELCOME_BANNER_COOKIE))
      .toBe(DISMISSED_COOKIE_VALUE);
    await expect(basePage.cookieBannerText).toBeVisible();

    await page.reload();
    await expect(basePage.cookieBannerText).toBeVisible();
    expect(
      await getCookieValue(context, COOKIE_CONSENT_COOKIE),
    ).toBeUndefined();

    await basePage.acceptCookies();
    await expect(basePage.cookieBannerText).toBeHidden();
    await expect
      .poll(() => getCookieValue(context, COOKIE_CONSENT_COOKIE))
      .toBe(DISMISSED_COOKIE_VALUE);

    await page.reload();
    await expect(basePage.basketCounter).toHaveText(EMPTY_BASKET_COUNT);
    await expect(basePage.welcomeTitle).toBeHidden();
    await expect(basePage.cookieBannerText).toBeHidden();
    await basePage.openSidenav();
    await expect(basePage.sidenavTitle).toBeVisible();
  });
});
