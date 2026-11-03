// @ts-check

import { TASK_PRIORITY, TASK_STATUS } from '../config/constants.js';

// ISO 8601: 2030-01-01T00:00:00.000Z
const ISO_DATE_PATTERN =
  '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$';

/**
 * One task, the schema from Swagger.
 * The API returns '' for a task without a description.
 */
export const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    status: { enum: Object.values(TASK_STATUS) },
    priority: { enum: Object.values(TASK_PRIORITY) },
    dueDate: { type: 'string', pattern: ISO_DATE_PATTERN },
    deletedAt: {
      anyOf: [{ type: 'null' }, { type: 'string', pattern: ISO_DATE_PATTERN }],
    },
  },
  required: [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
    'deletedAt',
  ],
  additionalProperties: false,
};

/**
 * The body of a list of tasks.
 */
export const taskListSchema = {
  type: 'array',
  items: taskSchema,
};
