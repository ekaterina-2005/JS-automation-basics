// @ts-check

import {
  HEADERS,
  JSON_CONTENT_TYPE,
  STAND_ENDPOINTS,
} from '../../config/constants.js';
import { InvalidInputError } from '../utils/errors.js';

/**
 * @typedef {object} ApiResponse
 * @property {number} status - The HTTP status code.
 * @property {any} body - The parsed JSON body, or the plain text when the server does not answer with JSON.
 */
/**
 * @typedef {object} TaskData
 * @property {string} [title] - The task title.
 * @property {string} [description] - The task description.
 * @property {string} [status] - TO_DO, IN_PROGRESS, PENDING, COMPLETED.
 * @property {string} [priority] - LOW, MEDIUM, HIGH.
 * @property {string} [dueDate] - The deadline in ISO 8601, for example 2030-01-01T00:00:00.000Z.
 */
/**
 * Client class for interacting with the React API Data Sample stand.
 * Authentication uses a cookie: after `login()` the `authToken` cookie is kept by the request context.
 * A client made with a context without the cookie sends requests as an anonymous user.
 * The methods do not throw on 4xx and 5xx statuses: the tests check the status themselves.
 */
export class StandClient {
  /**
   * Initializes the client.
   *
   * @param {import('@playwright/test').APIRequestContext} request - A request context with `baseURL` of the API stand.
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
   * @param {{ method?: string, body?: unknown }} [options={}] - The HTTP method and the JSON body.
   * @returns {Promise<ApiResponse>} The status and the body of the response.
   */
  async _request(endpoint, { method = 'GET', body } = {}) {
    const response = await this.request.fetch(endpoint, {
      method,
      data: body, // an object is sent as JSON, Content-Type is set automatically
    });

    const text = await response.text();
    // 204 has no body, so the body is parsed only when it is JSON and not empty
    const isJson = (
      response.headers()[HEADERS.CONTENT_TYPE.toLowerCase()] ?? ''
    ).includes(JSON_CONTENT_TYPE);

    return {
      status: response.status(),
      body: isJson && text ? JSON.parse(text) : text,
    };
  }

  /**
   * Logs in. On success the stand sets the `authToken` cookie, the request context keeps it.
   *
   * @param {{ email?: string, password?: string }} credentials - The request body, usually `{ email, password }`.
   * @returns {Promise<ApiResponse>} The response of POST.
   */
  async login(credentials) {
    return this._request(STAND_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: credentials,
    });
  }

  /**
   * Gets all active (not soft-deleted) tasks.
   *
   * @returns {Promise<ApiResponse>} The response of GET.
   */
  async getTasks() {
    return this._request(STAND_ENDPOINTS.TASKS);
  }

  /**
   * Gets a task by id.
   *
   * @param {number} id - The task id.
   * @returns {Promise<ApiResponse>} The response of GET.
   */
  async getTask(id) {
    return this._request(`${STAND_ENDPOINTS.TASKS}${id}`);
  }

  /**
   * Creates a task. The data is sent as it is, so a test can leave out fields.
   *
   * @param {TaskData} task - The task data.
   * @returns {Promise<ApiResponse>} The response of POST.
   */
  async createTask(task) {
    return this._request(STAND_ENDPOINTS.TASKS, {
      method: 'POST',
      body: task,
    });
  }

  /**
   * Updates a task. Note: the stand requires `status` and `priority` in every PUT.
   *
   * @param {number} id - The task id.
   * @param {TaskData} changes - The fields to change.
   * @returns {Promise<ApiResponse>} The response of PUT.
   */
  async updateTask(id, changes) {
    return this._request(`${STAND_ENDPOINTS.TASKS}${id}`, {
      method: 'PUT',
      body: changes,
    });
  }

  /**
   * Soft-deletes a task.
   *
   * @param {number} id - The task id.
   * @returns {Promise<ApiResponse>} The response of DELETE.
   */
  async deleteTask(id) {
    return this._request(`${STAND_ENDPOINTS.TASKS}${id}`, {
      method: 'DELETE',
    });
  }
}
