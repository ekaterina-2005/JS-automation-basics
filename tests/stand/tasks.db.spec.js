// @ts-check

import { test, expect } from '../../src/fixtures/stand.js';
import { countTasksByTitle, getTaskById } from '../../src/db/tasks.js';
import { HTTP_STATUS, TASK_STATUS } from '../../config/constants.js';

/*
 * The API does the action, SQL confirms what is saved.
 * The tests check only their own rows (by id or by the unique title).
 */
test.describe('Stand: API action, database check', () => {
  test('Create: the task is saved with the sent values', async ({
    db,
    createTask,
  }) => {
    const { data, response } = await test.step('API: create a task', () =>
      createTask());

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    const { id } = response.body;

    await test.step('DB: the row exists and has the sent values', async () => {
      await expect
        .poll(() => countTasksByTitle(db, data.title), {
          message: 'Exactly one row with the title must appear.',
        })
        .toBe(1);

      const row = await getTaskById(db, id);
      expect(row).toMatchObject({
        id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        deletedAt: null,
      });
      expect(row?.dueDate.toISOString()).toBe(data.dueDate);
      expect(
        row?.createdAt,
        'createdAt is set by the database.',
      ).toBeInstanceOf(Date);
    });
  });

  test('Update: the new status is saved, the other fields do not change', async ({
    api,
    db,
    createTask,
  }) => {
    const { data, response: created } = await createTask();
    const { id } = created.body;
    const before = await getTaskById(db, id);

    await test.step('API: change the status', async () => {
      // The stand requires status and priority in every PUT (the priority is sent unchanged)
      const response = await api.updateTask(id, {
        status: TASK_STATUS.IN_PROGRESS,
        priority: data.priority,
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.status).toBe(TASK_STATUS.IN_PROGRESS);
    });

    await test.step('DB: new status, the other fields as before', async () => {
      await expect
        .poll(() => getTaskById(db, id))
        .toEqual({ ...before, status: TASK_STATUS.IN_PROGRESS });
    });
  });

  test('Delete: the API does not return the task, the row stays with deletedAt', async ({
    api,
    db,
    createTask,
  }) => {
    const { response: created } = await createTask();
    const { id } = created.body;
    const before = await getTaskById(db, id);

    await test.step('API: delete the task', async () => {
      const response = await api.deleteTask(id);

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
    });

    await test.step('API: the task is not shown any more', async () => {
      const response = await api.getTask(id);
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);

      const list = await api.getTasks();
      expect(list.status).toBe(HTTP_STATUS.OK);
      expect(
        list.body.map((/** @type {{ id: number }} */ task) => task.id),
      ).not.toContain(id);
    });

    await test.step('DB: the row stays, deletedAt is set (soft delete)', async () => {
      await expect
        .poll(() => getTaskById(db, id), {
          message: 'The row must stay.',
        })
        .toEqual({ ...before, deletedAt: expect.any(Date) });
    });
  });
});
