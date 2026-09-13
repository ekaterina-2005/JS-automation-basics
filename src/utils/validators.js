/**
 * Validates whether the provided data is an array.
 * @param {unknown} data - The argument to validate.
 * @throws {InvalidInputError} If the provided argument is not an array.
 */
export function isDataArray(data) {
  if (!Array.isArray(data)) {
    throw new InvalidInputError("Data argument must be a valid array.");
  }
}