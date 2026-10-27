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
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.decreaseIcon = page.locator('.fa-minus-square');
    this.increaseIcon = page.locator('.fa-plus-square');
    this.deleteIcon = page.locator('.fa-trash-alt');
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

  /**
   * Finds a button in the basket row of a product by the icon of the button.
   *
   * @param {string} productName - The exact full product name.
   * @param {import('@playwright/test').Locator} icon - The locator of the icon inside the button.
   * @returns {import('@playwright/test').Locator} The locator of the button.
   */
  rowButton(productName, icon) {
    return this.row(productName).getByRole('button').filter({ has: icon });
  }

  /**
   * Decreases the quantity of a product by one with the "-" button of its row.
   *
   * @param {string} productName - The exact full product name.
   * @returns {Promise<void>} Resolves when the button is clicked.
   */
  async decreaseQuantity(productName) {
    await this.rowButton(productName, this.decreaseIcon).click();
  }

  /**
   * Increases the quantity of a product by one with the "+" button of its row.
   *
   * @param {string} productName - The exact full product name.
   * @returns {Promise<void>} Resolves when the button is clicked.
   */
  async increaseQuantity(productName) {
    await this.rowButton(productName, this.increaseIcon).click();
  }

  /**
   * Deletes a product from the basket with the trash button of its row.
   *
   * @param {string} productName - The exact full product name.
   * @returns {Promise<void>} Resolves when the button is clicked.
   */
  async deleteProduct(productName) {
    await this.rowButton(productName, this.deleteIcon).click();
  }
}
