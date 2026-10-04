// @ts-check

/**
 * Base Page Object with the parts shared by each Juice Shop page.
 */
export class BasePage {
  /**
   * Creates the page object and defines the locators of the popups and the toolbar.
   *
   * @param {import('@playwright/test').Page} page - The Playwright page of the current test.
   */
  constructor(page) {
    this.page = page;

    // Start popups
    this.welcomeTitle = page.getByRole('heading', {
      name: 'Welcome to OWASP Juice Shop!',
    });
    this.closeWelcomeButton = page.getByRole('button', {
      name: 'Close Welcome Banner',
    });
    this.cookieBannerText = page.getByText(
      'This website uses fruit cookies to ensure you get the juiciest tracking experience.',
    );
    this.acceptCookiesButton = page.getByRole('button', {
      name: 'dismiss cookie message',
    });

    // Top toolbar
    this.openSidenavButton = page.getByRole('button', { name: 'Open Sidenav' });
    this.sidenavTitle = page.getByRole('heading', { name: 'OWASP Juice Shop' });
    this.accountButton = page.getByRole('button', {
      name: 'Show/hide account menu',
    });
    this.loginMenuItem = page.getByRole('menuitem', {
      name: 'Go to login page',
    });
    this.basketButton = page.getByRole('button', {
      name: 'Show the shopping cart',
    });
    // The counter has no role or label, so it is found by its CSS class inside the basket button
    this.basketCounter = this.basketButton.locator('.fa-layers-counter');
  }

  /**
   * Opens a page of the shop.
   *
   * @param {string} [path='/'] - The path relative to `baseURL` from playwright.config.js.
   * @returns {Promise<void>} Resolves when the page is loaded.
   */
  async open(path = '/') {
    await this.page.goto(path);
  }

  /**
   * Closes the Welcome banner and accepts cookies. Both popups appear in each new browser session.
   *
   * @returns {Promise<void>} Resolves when both popups are dismissed.
   */
  async dismissPopups() {
    await this.closeWelcomeButton.click();
    await this.acceptCookiesButton.click();
  }

  /**
   * Opens the side menu with the "Open Sidenav" button of the toolbar.
   *
   * @returns {Promise<void>} Resolves when the button is clicked.
   */
  async openSidenav() {
    await this.openSidenavButton.click();
  }

  /**
   * Opens the Login page through the toolbar: Account > Login.
   *
   * @returns {Promise<void>} Resolves when the "Login" menu item is clicked.
   */
  async goToLogin() {
    await this.accountButton.click();
    await this.loginMenuItem.click();
  }

  /**
   * Opens the Basket page with the "Your Basket" button of the toolbar.
   *
   * @returns {Promise<void>} Resolves when the button is clicked.
   */
  async openBasket() {
    await this.basketButton.click();
  }
}
