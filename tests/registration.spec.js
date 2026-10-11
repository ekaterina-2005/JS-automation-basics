// @ts-check

import { test, expect } from '../fixtures/index.js';
import { RegistrationPage } from '../pages/RegistrationPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { createUniqueEmail } from '../src/utils/validators.js';
import {
  INVALID_EMAIL,
  MASKED_INPUT_TYPE,
  MISMATCHED_PASSWORD,
  OWASP_LOGIN_PAGE_URL,
  OWASP_REGISTRATION_PAGE_URL,
  TEST_EMAIL_DOMAIN,
  TEST_EMAIL_PREFIX,
  TEST_SECURITY_ANSWER,
  TEST_USER_PASSWORD,
  TOO_LONG_PASSWORD,
  TOO_SHORT_PASSWORD,
} from '../config/constants.js';

test.describe('Registration', () => {
  /** @type {RegistrationPage} */
  let registrationPage;
  /** @type {LoginPage} */
  let loginPage;

  test.beforeEach(async ({ dismissedPage }) => {
    loginPage = new LoginPage(dismissedPage);
    registrationPage = new RegistrationPage(dismissedPage);
  });

  test('Navigation Login <-> Registration', async ({ dismissedPage }) => {
    await loginPage.openAccountMenu();

    await expect(loginPage.loginMenuItem).toBeVisible();

    await loginPage.selectLoginMenuItem();

    await expect(dismissedPage).toHaveURL(OWASP_LOGIN_PAGE_URL);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    await loginPage.goToRegistration();

    await expect(dismissedPage).toHaveURL(OWASP_REGISTRATION_PAGE_URL);
    await expect(registrationPage.heading).toBeVisible();

    await registrationPage.backToLogin();

    await expect(dismissedPage).toHaveURL(OWASP_LOGIN_PAGE_URL);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test.describe('Registration form', () => {
    test.beforeEach(async ({ dismissedPage }) => {
      await loginPage.goToLogin();
      await loginPage.goToRegistration();
      await expect(dismissedPage).toHaveURL(OWASP_REGISTRATION_PAGE_URL);
    });

    test('Registration form shows validation errors for invalid data', async () => {
      await test.step('Fill "Email" with an invalid email', async () => {
        await registrationPage.fillEmail(INVALID_EMAIL);

        await expect(registrationPage.invalidEmailError).toBeVisible();
      });

      await test.step('Fill the passwords with a too short value', async () => {
        await registrationPage.fillPassword(TOO_SHORT_PASSWORD);
        await registrationPage.fillRepeatPassword(TOO_SHORT_PASSWORD);

        await expect(registrationPage.passwordLengthError).toBeVisible();
      });

      await test.step('Change the passwords to a too long value', async () => {
        await registrationPage.fillPassword(TOO_LONG_PASSWORD);
        await registrationPage.fillRepeatPassword(TOO_LONG_PASSWORD);

        await expect(registrationPage.passwordLengthError).toBeVisible();
      });

      await test.step('Change the passwords to two different valid values', async () => {
        await registrationPage.fillPassword(TEST_USER_PASSWORD);
        await registrationPage.fillRepeatPassword(MISMATCHED_PASSWORD);

        await expect(registrationPage.passwordsMismatchError).toBeVisible();
        await expect(registrationPage.passwordLengthError).toBeHidden();
      });

      await test.step('Select the security question and fill "Answer"', async () => {
        await registrationPage.selectFirstSecurityQuestion();
        await registrationPage.fillSecurityAnswer(TEST_SECURITY_ANSWER);

        await expect(registrationPage.registerButton).toBeDisabled();
      });
    });

    test('"Register" button state when a required field is empty', async () => {
      await test.step('All fields are empty', async () => {
        await expect(registrationPage.registerButton).toBeDisabled();
      });

      await test.step('All fields are valid except "Security Question"', async () => {
        await registrationPage.fillEmail(
          createUniqueEmail(TEST_EMAIL_PREFIX, TEST_EMAIL_DOMAIN),
        );
        await registrationPage.fillPassword(TEST_USER_PASSWORD);
        await registrationPage.fillRepeatPassword(TEST_USER_PASSWORD);
        await registrationPage.fillSecurityAnswer(TEST_SECURITY_ANSWER);

        await expect(registrationPage.registerButton).toBeDisabled();
      });

      await test.step('All fields are valid except "Answer"', async () => {
        await registrationPage.selectFirstSecurityQuestion();
        await registrationPage.clearSecurityAnswer();

        await expect(registrationPage.registerButton).toBeDisabled();
      });

      await test.step('All fields are filled with valid data', async () => {
        await registrationPage.fillSecurityAnswer(TEST_SECURITY_ANSWER);

        await expect(registrationPage.registerButton).toBeEnabled();
      });
    });

    test('Register with valid data', async ({ dismissedPage }) => {
      // A unique email for each run, so the test does not depend on users created earlier
      const email = createUniqueEmail(TEST_EMAIL_PREFIX, TEST_EMAIL_DOMAIN);

      await registrationPage.fillEmail(email);

      await expect(registrationPage.emailInput).toHaveValue(email);

      await registrationPage.fillPassword(TEST_USER_PASSWORD);
      await registrationPage.fillRepeatPassword(TEST_USER_PASSWORD);

      await expect(registrationPage.passwordInput).toHaveValue(
        TEST_USER_PASSWORD,
      );
      await expect(registrationPage.repeatPasswordInput).toHaveValue(
        TEST_USER_PASSWORD,
      );
      await expect(registrationPage.passwordInput).toHaveAttribute(
        'type',
        MASKED_INPUT_TYPE,
      );
      await expect(registrationPage.repeatPasswordInput).toHaveAttribute(
        'type',
        MASKED_INPUT_TYPE,
      );
      await expect(registrationPage.validationErrors).toHaveCount(0);

      const question = await registrationPage.selectFirstSecurityQuestion();
      await registrationPage.fillSecurityAnswer(TEST_SECURITY_ANSWER);

      await expect(registrationPage.securityQuestionSelect).toContainText(
        question,
      );
      await expect(registrationPage.securityAnswerInput).toHaveValue(
        TEST_SECURITY_ANSWER,
      );

      await registrationPage.register();

      await expect(registrationPage.successMessage).toBeVisible();
      await expect(dismissedPage).toHaveURL(OWASP_LOGIN_PAGE_URL);
    });
  });

  test('Register with an already registered email', async ({
    dismissedPage,
    user,
  }) => {
    await loginPage.goToRegistration();
    await expect(dismissedPage).toHaveURL(OWASP_REGISTRATION_PAGE_URL);

    await registrationPage.fillForm({
      email: user.email,
      password: user.password,
      securityAnswer: TEST_SECURITY_ANSWER,
    });

    await expect(registrationPage.validationErrors).toHaveCount(0);

    await registrationPage.register();

    await expect(registrationPage.emailNotUniqueError).toBeVisible();
    await expect(dismissedPage).toHaveURL(OWASP_REGISTRATION_PAGE_URL);
  });
});
