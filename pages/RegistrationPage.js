// @ts-check

import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { KEYS } from '../config/keycodes.js';
import {
  OPEN_SELECT_TIMEOUT_MS,
  OPTION_VISIBLE_TIMEOUT_MS,
} from '../config/constants.js';

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
    this.securityQuestionSelect = page.getByRole('combobox', {
      name: 'Selection list for the security question',
    });

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
    this.validationErrors = page.locator('mat-error');
    this.invalidEmailError = this.validationErrors.filter({
      hasText: 'Email address is not valid.',
    });
    this.passwordLengthError = this.validationErrors.filter({
      hasText: 'Password must be 5-40 characters long.',
    });
    this.passwordsMismatchError = this.validationErrors.filter({
      hasText: 'Passwords do not match',
    });
    // The server error is shown above the form, it is not a field error
    this.emailNotUniqueError = page.getByText('Email must be unique');
  }

  /**
   * Selects the first option in the "Security Question" list.
   *
   * @returns {Promise<string>} The text of the selected question.
   */
  async selectFirstSecurityQuestion() {
    const firstOption = this.securityQuestionOptions.first();

    await expect(async () => {
      await this.securityQuestionSelect.press(KEYS.ENTER);
      await expect(firstOption).toBeVisible({
        timeout: OPTION_VISIBLE_TIMEOUT_MS,
      });
    }).toPass({ timeout: OPEN_SELECT_TIMEOUT_MS }); // A single press of "Enter" is sometimes not enough to open the list

    const question = (await firstOption.innerText()).trim();

    await firstOption.click();

    return question;
  }

  /**
   * Fills the "Email" field and leaves it, because the form shows a field error only after the field loses focus.
   *
   * @param {string} email - The value for the "Email" field.
   * @returns {Promise<void>} Resolves when the field is filled and has lost focus.
   */
  async fillEmail(email) {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
  }

  /**
   * Fills the "Password" field and leaves it, because the form shows a field error only after the field loses focus.
   *
   * @param {string} password - The value for the "Password" field.
   * @returns {Promise<void>} Resolves when the field is filled and has lost focus.
   */
  async fillPassword(password) {
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
  }

  /**
   * Fills the "Repeat Password" field and leaves it, because the form shows a field error only after the field loses focus.
   *
   * @param {string} password - The value for the "Repeat Password" field.
   * @returns {Promise<void>} Resolves when the field is filled and has lost focus.
   */
  async fillRepeatPassword(password) {
    await this.repeatPasswordInput.fill(password);
    await this.repeatPasswordInput.blur();
  }

  /**
   * Fills the "Answer" field of the security question.
   *
   * @param {string} answer - The value for the "Answer" field.
   * @returns {Promise<void>} Resolves when the field is filled.
   */
  async fillSecurityAnswer(answer) {
    await this.securityAnswerInput.fill(answer);
  }

  /**
   * Clears the "Answer" field of the security question.
   *
   * @returns {Promise<void>} Resolves when the field is empty.
   */
  async clearSecurityAnswer() {
    await this.securityAnswerInput.clear();
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
