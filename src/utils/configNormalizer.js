import { InvalidInputError } from "./errors.js";
import { CURRENCY, ROLE } from "../../config/constants.js";

/**
 * Normalizes raw configuration object by extracting and formatting required fields.
 *
 * @param {object} rawConfig - The raw configuration object from the server.
 * @returns {object} Normalized object containing url, currency and role.
 * @throws {InvalidInputError} If rawConfig is not a valid object.
 */
export function normalizeConfig(rawConfig) {
  if (
    rawConfig === null ||
    typeof rawConfig !== "object" ||
    Array.isArray(rawConfig)
  ) {
    throw new InvalidInputError("Data argument must be a non-empty object.");
  }

  // Destructuring
  const { gateway: url, currency = CURRENCY, userDetails } = rawConfig;

  const role = userDetails?.profile?.role ?? ROLE;

  return { url, currency, role };
}
