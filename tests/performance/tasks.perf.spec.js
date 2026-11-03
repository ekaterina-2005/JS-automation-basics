// @ts-check

import { test, expect } from '../../src/fixtures/stand.js';
import { runSeries, summarize } from '../../src/utils/measure.js';

const REQUESTS = 20;
const BATCH_SIZE = 5;
const RUNS = 3;
const WARMUP = 3;

/**
 * Runs the series and prints the table of the numbers.
 *
 * @param {() => Promise<{ status: number }>} send - Sends one request to the endpoint.
 */
async function runExperiment(send) {
  const rows = [];

  for (let run = 1; run <= RUNS; run++) {
    const sequential = await runSeries(send, REQUESTS, 1);
    rows.push({
      run,
      scenario: 'sequential',
      ...summarize(sequential, WARMUP),
    });

    const parallel = await runSeries(send, REQUESTS, BATCH_SIZE);
    rows.push({ run, scenario: 'parallel', ...summarize(parallel, WARMUP) });
  }

  // eslint-disable-next-line no-console
  console.log(test.info().title);
  // eslint-disable-next-line no-console
  console.table(rows);

  for (const row of rows) {
    expect
      .soft(
        row.errors,
        `Run ${row.run}, ${row.scenario}: requests with errors.`,
      )
      .toBe(0);
  }
}

// Performance experiment
test.describe('Performance: GET endpoints of the stand', () => {
  test('GET /api/tasks', async ({ api }) => {
    await runExperiment(() => api.getTasks());
  });

  test('GET /api/tasks/{id}', async ({ api, createTask }) => {
    const { response: created } = await createTask();

    await runExperiment(() => api.getTask(created.body.id));
  });
});
