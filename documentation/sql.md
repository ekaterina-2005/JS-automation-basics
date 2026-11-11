# SQL notes: React API Data Sample

Stand: http://localhost:4000 (API), React API Data Sample.
Swagger: http://localhost:4000/api-docs/.
Database: localhost:5433, PostgreSQL 15 in Docker.
Source: backend/prisma/schema.prisma of the stand, psql.
Data: the seed of the stand (30 tasks), task 1 soft-deleted through the API in Swagger.

## Structure

`\dt` shows two tables: `Task` (the data of the app) and `_prisma_migrations` (service table of Prisma).
The entity "task" is stored in one table `Task`, without relations to other tables.

`\d "Task"`:

| Column      | Type                                                      | Null     | Default                                 |
| ----------- | --------------------------------------------------------- | -------- | --------------------------------------- |
| id          | integer                                                   | not null | `nextval('"Task_id_seq"')`, primary key |
| title       | text                                                      | not null |                                         |
| description | text                                                      | null     |                                         |
| status      | enum `TaskStatus`: TO_DO, IN_PROGRESS, PENDING, COMPLETED | not null |                                         |
| priority    | enum `TaskPriority`: LOW, MEDIUM, HIGH                    | not null |                                         |
| dueDate     | timestamp(3) without time zone                            | not null |                                         |
| createdAt   | timestamp(3) without time zone                            | not null | `CURRENT_TIMESTAMP`                     |
| deletedAt   | timestamp(3) without time zone                            | null     |                                         |

Note: Prisma names the table after the model, so "Task" and the camelCase columns need double quotes.

Note: soft delete. A deleted task keeps its row, "deletedAt" gets a timestamp. Active task: "deletedAt" IS NULL.

Checked in Swagger: `DELETE /api/tasks/1` -> 204, `GET /api/tasks/1` -> 404, in the database the row with id 1 stays and has `deletedAt`.

## 1. WHERE

    -- Question: which active tasks have the HIGH priority and are not completed yet?
    SELECT id, title, status, "dueDate"
    FROM "Task"
    WHERE priority = 'HIGH'
      AND status <> 'COMPLETED'
      AND "deletedAt" IS NULL
    ORDER BY id;

Result: 4 tasks, ids 4, 7, 19 and 29, all IN_PROGRESS. Task 1 (HIGH, TO_DO) is not in the list: it is soft-deleted.

## 2. ORDER BY

    -- Question: which 5 open tasks have the nearest due date (what must be done first)?
    SELECT id, title, status, priority, "dueDate"
    FROM "Task"
    WHERE status <> 'COMPLETED'
      AND "deletedAt" IS NULL
    ORDER BY "dueDate" ASC, id ASC
    LIMIT 5;

Result: ids 3, 4, 5, 7 and 8, due dates from 2024-03-01 to 2024-08-01. Task 1 is deleted, tasks 2 and 6 are COMPLETED, so they are skipped.

Note: `id` is the second sort key: tasks with the same due date always come in the same order.

## 3. COUNT

    -- Question: how many tasks are in the table, how many of them are active and how many are soft-deleted?
    SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE "deletedAt" IS NULL) AS active,
           COUNT(*) FILTER (WHERE "deletedAt" IS NOT NULL) AS soft_deleted
    FROM "Task";

Result: total 30, active 29, soft-deleted 1. After a soft delete the row is still counted in `total` and moves from `active` to `soft_deleted`.

## 4. JOIN

    -- The schema has only one business table ("Task"), so the join is with the list of the TaskStatus enum values.
    -- Question: how many active tasks has each status, including statuses without tasks (0)?
    -- LEFT JOIN keeps a status even if no task has it; GROUP BY over "Task" would not show it.
    SELECT s.status, COUNT(t.id) AS active_tasks
    FROM unnest(enum_range(NULL::"TaskStatus")) AS s(status)
    LEFT JOIN "Task" AS t
           ON t.status = s.status
          AND t."deletedAt" IS NULL
    GROUP BY s.status
    ORDER BY s.status;

Result: TO_DO 6, IN_PROGRESS 8, PENDING 6, COMPLETED 9, together 29 active tasks. TO_DO has 6 instead of 7: deleted task 1 is not counted.

Note: the condition `"deletedAt" IS NULL` is in `ON`, not in `WHERE`. In `WHERE` it would remove the rows with `t.id = NULL` and turn the LEFT JOIN into an INNER JOIN, so a status without tasks would disappear instead of showing 0.

## 5. GROUP BY + HAVING

    -- Question: which combinations of priority and status have more than 2 active tasks?
    SELECT priority, status, COUNT(*) AS tasks
    FROM "Task"
    WHERE "deletedAt" IS NULL
    GROUP BY priority, status
    HAVING COUNT(*) > 2
    ORDER BY tasks DESC, priority, status;

Result: 6 combinations. The largest are MEDIUM + TO_DO (6) and HIGH + COMPLETED (5), then LOW + IN_PROGRESS, LOW + PENDING and HIGH + IN_PROGRESS (4 each), and MEDIUM + COMPLETED (3).

Note: `WHERE` filters rows before grouping, `HAVING` filters groups after it.

## 6. Date condition

    -- Question: how many open tasks are overdue, and which due date is the oldest?
    SELECT COUNT(*) AS overdue_tasks,
           MIN("dueDate") AS oldest_due_date
    FROM "Task"
    WHERE "dueDate" < NOW()
      AND status <> 'COMPLETED'
      AND "deletedAt" IS NULL;

Result: 20 overdue tasks, the oldest due date is 2024-03-01. All open tasks are overdue: the seed has only due dates in 2024-2025. Without deleted task 1 the oldest date moved from 2024-01-01 to 2024-03-01.

## 7. Self JOIN

    -- Question: are there active tasks with the same title (duplicates)?
    SELECT a.id AS first_id, b.id AS second_id, a.title
    FROM "Task" AS a
    JOIN "Task" AS b
      ON a.title = b.title
     AND a.id < b.id
    WHERE a."deletedAt" IS NULL
      AND b."deletedAt" IS NULL;

Result: 0 rows, there are no duplicate titles.

Note: `a.id < b.id` removes a pair of a row with itself and the same pair in reverse order.

## 8. LIKE

    -- Question: are there tasks left by the autotests (title prefix "aqa-")? After a test run the answer must be 0.
    SELECT COUNT(*) AS autotest_tasks
    FROM "Task"
    WHERE title LIKE 'aqa-%';

Result: 0. The autotests create tasks with titles `aqa-<uuid>` and must delete them, so this query checks the cleanup after a run.
