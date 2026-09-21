import 'dotenv/config';
import { CONTEXT_TIMEOUT_MS } from '../config/constants.js';
import { InvalidInputError } from './utils/errors.js';

/**
 * Client class for interacting with the ReqRes API.
 */
export class ReqResClient {
  /**
   * Initializes the ReqRes API client.
   * Reads the base URL and API key from environment variables.
   *
   * @throws {Error} If API_BASE_URL is not provided in the environment.
   */
  constructor() {
    if (!process.env.API_BASE_URL) {
      throw new Error('API_BASE_URL must be a non-empty URL.');
    }

    if (!process.env.REQRES_API_KEY) {
      throw new Error('REQRES_API_KEY must be provided in the environment.');
    }

    this.baseUrl = process.env.API_BASE_URL;
    this.apiKey = process.env.REQRES_API_KEY;
  }

  /**
   * Core request method that wraps the native fetch API.
   *
   * @private
   * @param {string} endpoint - The API endpoint to call.
   * @param {RequestInit} [options={}] - Fetch options (method, headers, body, etc.).
   * @returns {Promise<any>} A promise resolving to the parsed JSON response.
   * @throws {Error & { status?: number }} If the HTTP response status is not OK.
   */
  async _request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  /**
   * Gets a specific user by their ID.
   *
   * @param {number|string} id - The unique identifier of the user.
   * @returns {Promise<{ data: { email: string, [key: string]: any } }>} A promise resolving to the user data.
   */
  async getUser(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new InvalidInputError('User id must be provided.');
    }

    return this._request(`/api/users/${id}`, {
      headers: { 'x-api-key': this.apiKey },
    });
  }

  /**
   * Creates a new user with the provided data.
   *
   * @param {Object} userData - The data for the new user.
   * @returns {Promise<Object>} A promise resolving to the created user's data.
   */
  async createUser(userData) {
    if (!userData || typeof userData !== 'object') {
      throw new InvalidInputError('userData must be a non-empty object.');
    }

    return this._request(`/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
      body: JSON.stringify(userData),
    });
  }

  /**
   * Tests the preservation of the `this` context.
   */
  /*
   * When the Node.js timer finishes, the system calls the regular function directly,
   * without binding it to any object. A regular function always determines its `this`
   * context at the moment of invocation. Because modern ES modules run in strict mode,
   * the function cannot default to the global object, so its `this` becomes `undefined`.
   * As a result, trying to read `this.baseUrl` returns `undefined`.
   *
   * An arrow function does not have its own `this` binding.
   * It lexically inherits `this` from its surrounding scope (the place where it was defined).
   * In this case, it simply takes `this` from the outer method,
   * which correctly points to the `ReqResClient` instance.
   */
  testContext() {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(this.baseUrl);
    }, CONTEXT_TIMEOUT_MS);
  }
}

/*
 * When copying the method into a variable (const fn = client.getUser),
 * only a reference to the function itself is passed,
 * and the connection to the object is lost.
 * Since there is no object to the left when calling fn() (i.e., no `client.` call),
 * the context is lost.
 * And because we are using modern ESM modules (strict mode),
 * `this` becomes `undefined` when the context is lost.
 */
// const client = new ReqResClient();
// const fn = client.getUser;
// fn(1);
