// @ts-check

import {
  ENDPOINTS,
  HTTP_STATUS,
  HEADERS,
  BEARER_PREFIX,
  JSON_CONTENT_TYPE,
} from '../../config/constants.js';
import { InvalidInputError } from '../utils/errors.js';

/**
 * @typedef {object} ApiResponse
 * @property {number} status - The HTTP status code.
 * @property {any} body - The parsed JSON body, or the plain text when the server does not answer with JSON.
 */
/**
 * @typedef {object} RequestOptions
 * @property {string} [method='GET'] - The HTTP method.
 * @property {string} [token] - The JWT. When it is omitted, the request has no `Authorization` header.
 * @property {unknown} [body] - The request body, sent as JSON.
 * @property {Record<string, string>} [query] - The query parameters.
 */
/**
 * Client class for interacting with the OWASP Juice Shop API.
 * The methods do not throw on 4xx and 5xx statuses: the tests check the status themselves.
 */
export class JuiceShopClient {
  /**
   * Initializes the JuiceShop API client.
   *
   * @param {import('@playwright/test').APIRequestContext} request - The request fixture of Playwright.
   * @throws {InvalidInputError} If the request context is not provided.
   */
  constructor(request) {
    if (!request) {
      throw new InvalidInputError('APIRequestContext must be provided.');
    }

    this.request = request;
  }

  /**
   * Core request method that wraps the Playwright APIRequestContext.
   *
   * @private
   * @param {string} endpoint - The endpoint relative to the base URL.
   * @param {RequestOptions} [options={}] - The method, token, body and query parameters.
   * @returns {Promise<ApiResponse>} The status and the body of the response.
   */
  async _request(endpoint, { method = 'GET', token, body, query } = {}) {
    // const url = new URL(endpoint, this.baseUrl);
    // url.search = new URLSearchParams(query ?? {}).toString();

    /** @type {Record<string, string>} */
    const headers = {};

    if (token !== undefined) {
      headers[HEADERS.AUTHORIZATION] = `${BEARER_PREFIX} ${token}`;
    }
    // if (body !== undefined) {
    //   headers[HEADERS.CONTENT_TYPE] = JSON_CONTENT_TYPE;
    // }

    const response = await this.request.fetch(endpoint, {
      method,
      headers,
      params: query, // replaces URLSearchParams
      data: body, // an object is sent as JSON, Content-Type is set automatically
    });

    const text = await response.text();
    // A failed login answers with plain text, so the body is parsed only when it is JSON
    const isJson = (
      response.headers()[HEADERS.CONTENT_TYPE.toLowerCase()] ?? ''
    ).includes(JSON_CONTENT_TYPE);
    // const isJson = (response.headers.get(HEADERS.CONTENT_TYPE) ?? '').includes(
    //   JSON_CONTENT_TYPE,
    // );

    return {
      status: response.status(),
      body: isJson ? JSON.parse(text) : text,
    };
  }

  /**
   * Registers a user. The data is sent as it is, so a test can leave out fields.
   *
   * @param {object} userData - The registration data.
   * @returns {Promise<ApiResponse>} The response of POST.
   */
  async register(userData) {
    return this._request(ENDPOINTS.REGISTRATION, {
      method: 'POST',
      body: userData,
    });
  }

  /**
   * Sends the login request with any body, including bodies with missing fields.
   *
   * @param {object} credentials - The request body, usually `{ email, password }`.
   * @returns {Promise<ApiResponse>} The response of POST.
   */
  async login(credentials) {
    return this._request(ENDPOINTS.LOGIN, {
      method: 'POST',
      body: credentials,
    });
  }

  /**
   * Logs in and returns the token of the user.
   *
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<string>} The JWT from `authentication.token`.
   * @throws {Error} If the login does not succeed.
   */
  async getToken(email, password) {
    const response = await this.login({ email, password });

    if (response.status !== HTTP_STATUS.OK) {
      throw new Error(`Login failed with HTTP ${response.status}.`);
    }

    return response.body.authentication.token;
  }

  /**
   * Searches products by name or description.
   *
   * @param {string} [query] - The search text. When it is omitted, the request has no `q` parameter.
   * @returns {Promise<ApiResponse>} The response of GET.
   */
  async searchProducts(query) {
    return this._request(ENDPOINTS.SEARCH, {
      query: query === undefined ? {} : { q: query },
    });
  }

  /**
   * Gets a basket with its products.
   *
   * @param {string | undefined} token - The JWT, or `undefined` for a request without `Authorization`.
   * @param {number | string} basketId - The basket id.
   * @returns {Promise<ApiResponse>} The response of GET.
   */
  async getBasket(token, basketId) {
    return this._request(`${ENDPOINTS.BASKET}${basketId}`, { token });
  }

  /**
   * Adds a product to a basket. The item is sent as it is, so a test can leave out fields.
   *
   * @param {string | undefined} token - The JWT, or `undefined` for a request without `Authorization`.
   * @param {object} item - The request body `{ ProductId, BasketId, quantity }`.
   * @returns {Promise<ApiResponse>} The response of POST.
   */
  async addToBasket(token, item) {
    return this._request(ENDPOINTS.BASKET_ITEMS, {
      method: 'POST',
      token,
      body: item,
    });
  }

  /**
   * Changes the quantity of a basket item.
   *
   * @param {string | undefined} token - The JWT, or `undefined` for a request without `Authorization`.
   * @param {number} itemId - The basket item id (not the product id).
   * @param {number} quantity - The new quantity.
   * @returns {Promise<ApiResponse>} The response of PUT.
   */
  async updateBasketItem(token, itemId, quantity) {
    return this._request(`${ENDPOINTS.BASKET_ITEMS}${itemId}`, {
      method: 'PUT',
      token,
      body: { quantity },
    });
  }

  /**
   * Deletes a basket item.
   *
   * @param {string | undefined} token - The JWT, or `undefined` for a request without `Authorization`.
   * @param {number} itemId - The basket item id (not the product id).
   * @returns {Promise<ApiResponse>} The response of DELETE.
   */
  async deleteBasketItem(token, itemId) {
    return this._request(`${ENDPOINTS.BASKET_ITEMS}${itemId}`, {
      method: 'DELETE',
      token,
    });
  }
}
