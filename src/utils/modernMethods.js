import { InvalidInputError } from "./errors.js";
import { TRUE_STRING } from "../../config/constants.js";
import { parseCurrentPrice } from "./cleaner.js";

/**
 * Filters an array of products by their publication status.
 * Supports both boolean true and string "true" as valid published states.
 *
 * @param {Array} data - The array of product objects to filter.
 * @param {boolean} targetStatus - The expected publication status.
 * @returns {Array} A new array containing only matching products.
 * @throws {InvalidInputError} If the provided data argument is not an array.
 */
export function filterModern(data, targetStatus) {
  isDataArray(data);

  const filteredData = data.filter((product) => {
    const isPublished =
      product.isPublished === true || product.isPublished === TRUE_STRING;

    return isPublished === targetStatus;
  });

  return filteredData;
}

/**
 * Extracts product names from an array of objects and converts them to uppercase.
 *
 * @param {Array<{ productName: string, [key: string]: any }>} data - The array of product objects to transform.
 * @returns {string[]} A new array containing the uppercase product names.
 * @throws {InvalidInputError} If the provided data argument is not an array.
 */
export function transformModern(data) {
  isDataArray(data);

  const transformedProductNames = data.map((product) => {
    if (typeof product.productName === "string") {
      return product.productName.toUpperCase();
    } else {
      throw new InvalidInputError("All product names must be a string.");
    }
  });

  return transformedProductNames;
}

/**
 * Calculates the total cost of all valid items in the cart.
 *
 * @param {Array} data - An array of product objects containing currentPrice and stockQty.
 * @returns {number} The total calculated price of all products.
 * @throws {InvalidInputError} If the provided data argument is not an array.
 */
export function aggregateModern(data) {
  isDataArray(data);

  let totalPrice = data.reduce((total, product) => {
    if (!product || typeof product.stockQty !== "number") {
      return total;
    }

    return total + parseCurrentPrice(product.currentPrice) * product.stockQty;
  }, 0);

  return totalPrice;
}

function isDataArray(data) {
  if (!Array.isArray(data)) {
    throw new InvalidInputError("Data argument must be a valid array.");
  }
}
