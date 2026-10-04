// @ts-check

import { BasePage } from './BasePage.js';

/**
 * Page Object of the All Products page.
 */
export class ProductsPage extends BasePage {
  /**
   * Finds a product card by the product name. The name is the `alt` of the product `img`.
   *
   * @param {string} name - The exact full product name.
   * @returns {import('@playwright/test').Locator} The locator of the product card.
   */
  productCard(name) {
    return this.page
      .getByRole('article')
      .filter({ has: this.page.getByRole('img', { name, exact: true }) });
  }

  /**
   * Clicks the "Add to Basket" button on the card of a product.
   *
   * @param {string} name - The exact full product name.
   * @returns {Promise<void>} Resolves when the button is clicked.
   */
  async addToBasket(name) {
    await this.productCard(name)
      .getByRole('button', { name: 'Add to Basket' })
      .click();
  }

  /**
   * Finds the snackbar that is shown after a product is added to the basket.
   *
   * @param {string} name - The exact full product name.
   * @returns {import('@playwright/test').Locator} The locator of the snackbar text "Placed <name> into basket.".
   */
  addedToBasketMessage(name) {
    return this.page.getByText(`Placed ${name} into basket.`);
  }
}
