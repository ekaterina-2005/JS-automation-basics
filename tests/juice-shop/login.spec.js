// @ts-check

import { test, expect } from '@playwright/test';

// Built-in Juice Shop user, it exists right after the container starts
const EMAIL = 'admin@juice-sh.op';
const PASSWORD = 'admin123';

const loginData = [
  {
    title: 'valid email',
    email: EMAIL,
    password: PASSWORD,
    expected: 'success',
  },
  {
    title: 'wrong password',
    email: EMAIL,
    password: 'WrongPass123!',
    expected: 'error',
  },
  { title: 'empty email', email: '', password: PASSWORD, expected: 'disabled' },
];

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Close Welcome Banner' }).click();
    await page.getByRole('button', { name: 'dismiss cookie message' }).click();

    await page.getByRole('button', { name: 'Show/hide account menu' }).click();
    await page.getByRole('menuitem', { name: 'Go to login page' }).click();
    await expect(page).toHaveURL(/\/#\/login/);
  });

  for (const data of loginData) {
    test(`Login with ${data.title}`, async ({ page }) => {
      // The fields show the labels "Email" and "Password", but their accessible names come from aria-label
      const emailInput = page.getByLabel('Text field for the login email');
      const passwordInput = page.getByLabel(
        'Text field for the login password',
      );
      const loginButton = page.getByRole('button', {
        name: 'Login',
        exact: true,
      });

      await emailInput.fill(data.email);
      await passwordInput.fill(data.password);

      if (data.expected === 'disabled') {
        await expect(loginButton).toBeDisabled();
        return;
      }

      await loginButton.click();

      if (data.expected === 'error') {
        await expect(
          page.getByText('Invalid email or password.'),
        ).toBeVisible();
        await expect(page).toHaveURL(/\/#\/login/);
      } else {
        await expect(page).toHaveURL(/\/#\/search/);
      }
    });
  }
});
