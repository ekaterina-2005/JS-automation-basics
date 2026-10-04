// @ts-check

import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * Page Object of the User Registration page.
 */
export class RegistrationPage extends BasePage {
  /**
   * Creates the page object and defines the locators of the registration form.
   *
   * @param {import('@playwright/test').Page} page - The Playwright page of the current test.
   */
  constructor(page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'User Registration' });
    this.emailInput = page.getByLabel('Email address field');
    this.passwordInput = page.getByLabel('Field for the password');
    this.repeatPasswordInput = page.getByLabel('Field to confirm the password');
    this.securityQuestionSelect = page.getByLabel(
      'Selection list for the security question',
    );
    this.securityQuestionOptions = page.getByRole('option');
    this.securityAnswerInput = page.getByLabel(
      'Field for the answer to the security question',
    );
    this.registerButton = page.getByRole('button', {
      name: 'Button to complete the registration',
    });
    this.successMessage = page.getByText(
      'Registration completed successfully. You can now log in.',
    );
    this.loginLink = page.getByRole('link', { name: 'Already a customer?' });
  }

  /**
   * Selects the first option in the "Security Question" list.
   *
   * @returns {Promise<void>} Resolves when the option is selected.
   */
  async selectFirstSecurityQuestion() {
    const firstOption = this.securityQuestionOptions.first();

    await expect(async () => {
      await this.securityQuestionSelect.press('Enter');
      await expect(firstOption).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15000 }); // A single press of the "Enter" is sometimes not enough.

    await firstOption.click();
  }

  /**
   * Fills all fields of the registration form without submitting it.
   *
   * @param {object} data - The values for the form.
   * @param {string} data.email - The value for the "Email" field.
   * @param {string} data.password - The value for the "Password" and "Repeat Password" fields.
   * @param {string} data.securityAnswer - The value for the "Answer" field.
   * @returns {Promise<void>} Resolves when all fields are filled.
   */
  async fillForm({ email, password, securityAnswer }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.repeatPasswordInput.fill(password);
    await this.selectFirstSecurityQuestion();
    await this.securityAnswerInput.fill(securityAnswer);
  }

  /**
   * Submits the registration form with the "Register" button.
   *
   * @returns {Promise<void>} Resolves when the "Register" button is clicked.
   */
  async register() {
    await this.registerButton.click();
  }

  /**
   * Opens the Login page.
   *
   * @returns {Promise<void>} Resolves when the link is clicked.
   */
  async backToLogin() {
    await this.loginLink.click();
  }
}
