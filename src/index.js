// @ts-check

import assert from "node:assert";
import { BACKEND_DATA, RAW_CONFIG } from "../config/constants.js";
import {
  filterOldSchool,
  transformOldSchool,
  aggregateOldSchool,
} from "./utils/oldSchoolMethods.js";
import {
  filterModern,
  transformModern,
  aggregateModern,
} from "./utils/modernMethods.js";
import { normalizeConfig } from "./utils/configNormalizer.js";

// Terminal input: node src/index.js
assert.deepStrictEqual(
  filterOldSchool(BACKEND_DATA, true),
  filterModern(BACKEND_DATA, true),
  "Filter mismatch: The results of the for-loop and array.filter() are not equal.",
);

assert.deepStrictEqual(
  transformOldSchool(BACKEND_DATA),
  transformModern(BACKEND_DATA),
  "Transform mismatch: The results of the for-loop and array.map() are not equal.",
);

assert.strictEqual(
  aggregateOldSchool(BACKEND_DATA),
  aggregateModern(BACKEND_DATA),
  "Aggregate mismatch:  The results of the for-loop and array.reduce() are not equal.",
);

assert.deepStrictEqual(
  normalizeConfig(RAW_CONFIG),
  { url: "https://eu-region.shop.com", currency: "EUR", role: "viewer" },
  "Normalized config object does not match the expected structure or default values.",
);
