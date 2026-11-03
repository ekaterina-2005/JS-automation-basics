// @ts-check

/*
 * SQL queries to the "Task" table of the stand.
 * Prisma names the table after the model, so the table and the camelCase columns are in double quotes.
 * All values are passed as parameters ($N), they are never put into the query text.
 */
/**
 * @typedef {object} TaskRow
 * @property {number} id - The task id.
 * @property {string} title - The task title.
 * @property {string | null} description - The task description.
 * @property {string} status - TO_DO, IN_PROGRESS, PENDING, COMPLETED.
 * @property {string} priority - LOW, MEDIUM, HIGH.
 * @property {Date} dueDate - The deadline.
 * @property {Date} createdAt - Set by the database on insert.
 * @property {Date | null} deletedAt - Set on soft delete, `null` for an active task.
 */

const TASK_COLUMNS =
  'id, title, description, status, priority, "dueDate", "createdAt", "deletedAt"';

/**
 * Reads a task row by id, including a soft-deleted one.
 *
 * @param {import('pg').Client} db - The connected database client.
 * @param {number} id - The task id.
 * @returns {Promise<TaskRow | null>} The row or `null` when there is no row with this id.
 */
export async function getTaskById(db, id) {
  const { rows } = await db.query(
    `SELECT ${TASK_COLUMNS} FROM "Task" WHERE id = $1`,
    [id],
  );

  return rows[0] ?? null;
}

/**
 * Counts the rows with a title, both active and soft-deleted.
 *
 * @param {import('pg').Client} db - The connected database client.
 * @param {string} title - The exact title.
 * @returns {Promise<number>} The number of rows.
 */
export async function countTasksByTitle(db, title) {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM "Task" WHERE title = $1',
    [title],
  );

  return rows[0].count;
}

/**
 * Physically deletes a task row. Only for the rows created by the test itself.
 *
 * @param {import('pg').Client} db - The connected database client.
 * @param {number} id - The task id.
 * @returns {Promise<number>} The number of deleted rows: 1 or 0 (when the row did not exist).
 */
export async function hardDeleteTaskById(db, id) {
  const { rowCount } = await db.query('DELETE FROM "Task" WHERE id = $1', [id]);

  return rowCount ?? 0;
}
