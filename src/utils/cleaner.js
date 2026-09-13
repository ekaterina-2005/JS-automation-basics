import { InvalidInputError } from "./errors.js";

/**
 * Parses a price string and returns a clean number.
 *
 * @param {string} priceString - The string containing the price in the beginning.
 * @returns {number} The parsed price as a number.
 * @throws {InvalidInputError} If the argument is not a string.
 */
export function parseCurrentPrice(priceString) {
  if (priceString === null || priceString === undefined) {
    return 0;
  }
  if (typeof priceString !== "string") {
    throw new InvalidInputError("Price must be a string.");
  }
  return Number.parseFloat(priceString);
}
