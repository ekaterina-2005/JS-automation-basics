// @ts-check

import assert from "node:assert";
import {
  BACKEND_DATA,
  FILTER_STATUS,
  RAW_CONFIG,
  EXPECTED_CONFIG,
} from "../config/constants.js";
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

/* 
Terminal inputs: 
node src/index.js
npm run lint
*/
assert.deepStrictEqual(
  filterOldSchool(BACKEND_DATA, FILTER_STATUS),
  filterModern(BACKEND_DATA, FILTER_STATUS),
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
  EXPECTED_CONFIG,
  "Normalized config object does not match the expected structure or default values.",
);
