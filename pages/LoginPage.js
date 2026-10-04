// @ts-check

import { BasePage } from './BasePage.js';

/**
 * Page Object of the Login page.
 */
export class LoginPage extends BasePage {
  /**
   * Creates the page object and defines the locators of the login form.
   *
   * @param {import('@playwright/test').Page} page - The Playwright page of the current test.
   */
  constructor(page) {
    super(page);

    this.emailInput = page.getByLabel('Text field for the login email');
    this.passwordInput = page.getByLabel('Text field for the login password');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorMessage = page.getByText('Invalid email or password.');
    this.registrationLink = page.getByRole('link', {
      name: 'Not yet a customer?',
    });
    this.forgotPasswordLink = page.getByRole('link', {
      name: 'Forgot your password?',
    });
  }

  /**
   * Fills the login form without submitting it.
   *
   * @param {string} email - The value for the "Email" field.
   * @param {string} password - The value for the "Password" field.
   * @returns {Promise<void>} Resolves when both fields are filled.
   */
  async fillCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submits the login form with the "Login" button.
   *
   * @returns {Promise<void>} Resolves when the "Login" button is clicked.
   */
  async login() {
    await this.loginButton.click();
  }

  /**
   * Opens the User Registration page.
   *
   * @returns {Promise<void>} Resolves when the link is clicked.
   */
  async goToRegistration() {
    await this.registrationLink.click();
  }

  /**
   * Opens the Forgot Password page.
   *
   * @returns {Promise<void>} Resolves when the link is clicked.
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
