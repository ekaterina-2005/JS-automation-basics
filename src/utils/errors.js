/**
 * Custom error class for invalid input types.
 */
export class InvalidInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidInputError';
  }
}
