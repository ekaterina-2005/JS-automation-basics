// @ts-check

import { test, expect } from '../../src/fixtures/stand.js';
import { StandClient } from '../../src/api/StandClient.js';
import { taskListSchema, taskSchema } from '../../schemas/task.schema.js';
import { expectToMatchSchema } from '../../src/utils/apiHelpers.js';
import {
  AUTH_REQUIRED_MESSAGE,
  HTTP_STATUS,
  NON_EXISTING_ID,
  TASK_NOT_FOUND_MESSAGE,
} from '../../config/constants.js';

test.describe('Tasks API stand', () => {
  test('Get the task list', async ({ api, createTask }) => {
    const { response: created } = await createTask();
    const response = await api.getTasks();

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(response.body), 'Body must be an array.').toBe(true);
    expectToMatchSchema(taskListSchema, response.body);
    expect(
      response.body.map((/** @type {{ id: number }} */ task) => task.id),
    ).toContain(created.body.id);
    expect(
      response.body.every(
        (/** @type {{ deletedAt: string | null }} */ task) =>
          task.deletedAt === null,
      ),
      'The list must not contain soft-deleted tasks.',
    ).toBe(true);
  });

  test('Get a task by id', async ({ api, createTask }) => {
    const { data, response: created } = await createTask();
    const response = await api.getTask(created.body.id);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expectToMatchSchema(taskSchema, response.body);
    expect(response.body).toEqual({
      id: created.body.id,
      ...data,
      deletedAt: null,
    });
  });

  test('Create a task', async ({ createTask }) => {
    const { data, response } = await createTask();

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expectToMatchSchema(taskSchema, response.body);
    expect(response.body).toEqual({
      id: response.body.id,
      ...data,
      deletedAt: null,
    });
  });

  test('Get a non-existing task', async ({ api }) => {
    const response = await api.getTask(NON_EXISTING_ID);

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(response.body).toEqual({ message: TASK_NOT_FOUND_MESSAGE });
  });
});

// The test-scoped `request` of Playwright has its own context without the authToken cookie
test.describe('Tasks API stand: authorization', () => {
  test('Get the task list without the auth cookie', async ({ request }) => {
    const anonymous = new StandClient(request);

    const response = await anonymous.getTasks();

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toEqual({ message: AUTH_REQUIRED_MESSAGE });
  });

  test('Get a task by id without the auth cookie', async ({
    request,
    createTask,
  }) => {
    const { response: created } = await createTask();
    const anonymous = new StandClient(request);

    const response = await anonymous.getTask(created.body.id);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toEqual({ message: AUTH_REQUIRED_MESSAGE });
  });
});
