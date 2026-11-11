// @ts-check

import 'dotenv/config';
import { test as base, expect } from '@playwright/test';
import { StandClient } from '../api/StandClient.js';
import { connectDb } from '../db/connection.js';
import { hardDeleteTaskById } from '../db/tasks.js';
import { buildTask } from '../data/taskFactory.js';
import { HTTP_STATUS } from '../../config/constants.js';

/**
 * @typedef {import('../data/taskFactory.js').NewTask} NewTask
 * @typedef {import('../api/StandClient.js').ApiResponse} ApiResponse
 */
/**
 * @typedef {object} CreatedTask
 * @property {NewTask} data - The data sent to POST.
 * @property {ApiResponse} response - The response of POST.
 */
/**
 * @typedef {object} StandWorkerFixtures
 * @property {StandClient} api - The logged in client, the `authToken` cookie is kept by its context.
 * @property {import('pg').Client} db - The connection to the stand database.
 */
/**
 * @typedef {object} StandFixtures
 * @property {(overrides?: Partial<NewTask>) => Promise<CreatedTask>} createTask - Creates a task through the API.
 * The created tasks are deleted from the database after the test (its result does not matter).
 */
export const test =
  // fixtures: Fixtures<T, W, ...>
  /** @type {typeof base.extend<StandFixtures, StandWorkerFixtures>} */ (
    base.extend
  )({
    api: [
      async ({ playwright }, use, workerInfo) => {
        const { STAND_USER_EMAIL: email, STAND_USER_PASSWORD: password } =
          process.env;
        if (!email || !password) {
          throw new Error(
            'STAND_USER_EMAIL and STAND_USER_PASSWORD must be provided in the environment.',
          );
        }

        // Own context (not the test-scoped `request`): the cookie lives as long as the worker
        const context = await playwright.request.newContext({
          baseURL: workerInfo.project.use.baseURL,
        });
        const api = new StandClient(context);

        const response = await api.login({ email, password });
        if (response.status !== HTTP_STATUS.OK) {
          throw new Error(
            `Login to the stand failed with HTTP ${response.status}: ${JSON.stringify(response.body)}.`,
          );
        }

        await use(api);

        // The worker has finished its tests
        await context.dispose();
      },
      { scope: 'worker' },
    ],

    db: [
      // eslint-disable-next-line no-empty-pattern
      async ({}, use) => {
        const db = await connectDb();

        await use(db);

        // The worker has finished its tests
        await db.end();
      },
      { scope: 'worker' },
    ],

    createTask: async ({ api, db }, use) => {
      /** @type {number[]} */
      const createdIds = [];

      await use(async (overrides = {}) => {
        const data = buildTask(overrides);
        const response = await api.createTask(data);
        expect(response.status, 'Task must be created.').toBe(
          HTTP_STATUS.CREATED,
        );
        createdIds.push(response.body.id);

        return { data, response };
      });

      // Teardown: the API deletes only softly, so the rows of this test are removed with SQL
      for (const id of createdIds) {
        await hardDeleteTaskById(db, id);
      }
    },
  });

// Re-exported so that specs need a single import
export { expect };
