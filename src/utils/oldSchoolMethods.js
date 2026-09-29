import { InvalidInputError } from './errors.js';
import { isDataArray } from './validators.js';
import { TRUE_STRING } from '../../config/constants.js';
import { parseCurrentPrice } from './cleaner.js';

/**
 * Filters an array of products by their publication status using a classic for loop.
 * Supports both boolean true and string "true" as valid published states.
 *
 * @param {Array<Object>} data - The array of product objects to filter.
 * @param {boolean} targetStatus - The expected publication status.
 * @returns {Array<Object>} A new array containing only matching products.
 * @throws {InvalidInputError} If the provided data argument is not an array.
 */
export function filterOldSchool(data, targetStatus) {
  isDataArray(data);

  const filteredData = [];

  for (let i = 0; i < data.length; i++) {
    const product = data[i];

    const isPublished =
      product.isPublished === true || product.isPublished === TRUE_STRING;
    if (isPublished === targetStatus) {
      filteredData.push(product);
    }
  }

  return filteredData;
}

/**
 * Extracts product names from an array of objects and converts them to uppercase using a classic for loop.
 *
 * @param {Array<{ productName: string, [key: string]: any }>} data - The array of product objects to transform.
 * @returns {string[]} A new array containing the uppercase product names.
 * @throws {InvalidInputError} If the provided data argument is not an array.
 */
export function transformOldSchool(data) {
  isDataArray(data);

  const transformedProductNames = [];

  for (let i = 0; i < data.length; i++) {
    const product = data[i];

    if (typeof product.productName === 'string') {
      transformedProductNames.push(product.productName.toUpperCase());
    } else {
      throw new InvalidInputError('All product names must be a string.');
    }
  }

  return transformedProductNames;
}

/**
 * Calculates the total cost of all valid items in the cart using a classic for loop.
 *
 * @param {Array<Object>} data - An array of product objects containing currentPrice and stockQty.
 * @returns {number} The total calculated price of all products.
 * @throws {InvalidInputError} If the provided data argument is not an array.
 */
export function aggregateOldSchool(data) {
  isDataArray(data);

  let totalPrice = 0;

  for (let i = 0; i < data.length; i++) {
    const product = data[i];

    if (!product || typeof product.stockQty !== 'number') {
      continue;
    }

    totalPrice += parseCurrentPrice(product.currentPrice) * product.stockQty;
  }

  return totalPrice;
}
