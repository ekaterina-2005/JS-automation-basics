// @ts-check

import { BasePage } from './BasePage.js';

/**
 * Page Object of the Basket page.
 */
export class BasketPage extends BasePage {
  /**
   * Creates the page object and defines the locators of the basket.
   *
   * @param {import('@playwright/test').Page} page - The Playwright page of the current test.
   */
  constructor(page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Your Basket' });
    // Product rows only: the header row has no cells
    this.rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
    this.totalPrice = page.getByText(/^Total Price:/);
  }

  /**
   * Finds the basket row of a product.
   *
   * @param {string} productName - The exact full product name.
   * @returns {import('@playwright/test').Locator} The locator of the row.
   */
  row(productName) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: productName, exact: true }),
    });
  }

  /**
   * Finds a cell in the basket row of a product by the text of the cell.
   *
   * @param {string} productName - The exact full product name.
   * @param {string} text - The exact text of the cell: the quantity or the price.
   * @returns {import('@playwright/test').Locator} The locator of the cell.
   */
  cell(productName, text) {
    return this.row(productName).getByRole('cell', { name: text, exact: true });
  }
}
