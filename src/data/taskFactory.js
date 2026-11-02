// @ts-check

import { randomUUID } from 'node:crypto';
import {
  TASK_DESCRIPTION,
  TASK_DUE_DATE,
  TASK_PRIORITY,
  TASK_STATUS,
  TASK_TITLE_PREFIX,
} from '../../config/constants.js';

/**
 * @typedef {object} NewTask
 * @property {string} title - Unique for each call: `aqa-<uuid>`.
 * @property {string} description - The task description.
 * @property {string} status - TO_DO, IN_PROGRESS, PENDING, COMPLETED.
 * @property {string} priority - LOW, MEDIUM, HIGH.
 * @property {string} dueDate - The deadline in ISO 8601, for example 2030-01-01T00:00:00.000Z.
 */

/**
 * Builds a new task. The title is unique, so parallel tests never find each other's tasks.
 *
 * @param {Partial<NewTask>} [overrides={}] - The fields that matter for the scenario.
 * @returns {NewTask} The task data.
 */
export function buildTask(overrides = {}) {
  return {
    title: `${TASK_TITLE_PREFIX}${randomUUID()}`,
    description: TASK_DESCRIPTION,
    status: TASK_STATUS.TO_DO,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: TASK_DUE_DATE,
    ...overrides,
  };
}
