// @ts-check

import { test, expect } from '../../fixtures/api.js';
import { productListSchema } from '../../schemas/product.schema.js';
import {
  expectNoServerError,
  expectToMatchSchema,
} from '../../src/utils/apiHelpers.js';
import {
  HTTP_STATUS,
  LONG_QUERY_LENGTH,
  NO_MATCH_QUERY,
  SEARCH_QUERY,
  SEARCHED_ITEM_NAME,
  SINGLE_QUOTE_QUERY,
} from '../../config/constants.js';

const EMPTY_QUERY = '';

/**
 * Gets the names of the products in a search response.
 *
 * @param {{ body: { data: Array<{ name: string }> } }} response - The response of the search.
 * @returns {string[]} The product names.
 */
function productNames(response) {
  return response.body.data.map((product) => product.name);
}

test.describe('Search API', () => {
  test('Search a product by name', async ({ api }) => {
    const response = await api.searchProducts(SEARCH_QUERY);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expectToMatchSchema(productListSchema, response.body);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(productNames(response)).toContain(SEARCHED_ITEM_NAME);
  });

  for (const query of [
    SEARCH_QUERY.toLowerCase(),
    SEARCH_QUERY.toUpperCase(),
  ]) {
    test(`Search does not depend on the letter case: ${query}`, async ({
      api,
    }) => {
      const response = await api.searchProducts(query);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(productNames(response)).toContain(SEARCHED_ITEM_NAME);
    });
  }

  test('Search with an empty query', async ({ api }) => {
    const response = await api.searchProducts(EMPTY_QUERY);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(productNames(response)).toContain(SEARCHED_ITEM_NAME);
  });

  test('Search with no matches', async ({ api }) => {
    const response = await api.searchProducts(NO_MATCH_QUERY);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.data).toEqual([]);
  });

  test('Search without the q parameter', async ({ api }) => {
    const response = await api.searchProducts();

    expectNoServerError(response.status);
  });

  test('Search with a single quote', async ({ api }) => {
    const response = await api.searchProducts(SINGLE_QUOTE_QUERY);

    expectNoServerError(response.status);
  });

  test(`Search with a ${LONG_QUERY_LENGTH}-character query`, async ({
    api,
  }) => {
    const response = await api.searchProducts('a'.repeat(LONG_QUERY_LENGTH));

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.data).toEqual([]);
  });
});
