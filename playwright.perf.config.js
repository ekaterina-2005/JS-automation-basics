// @ts-check

import 'dotenv/config';
import { defineConfig } from '@playwright/test';

// API of the stand (React API Data Sample, started with docker compose)
const STAND_API_URL = process.env.STAND_API_URL ?? 'http://localhost:4000';

/**
 * Performance experiment: response time of GET endpoints of the stand.
 * A separate config, so the experiment never runs together with the functional tests.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/performance',
  /* Own folder: the functional tests and the experiment do not overwrite each other's results */
  outputDir: 'test-results-perf',
  /*
   * In series: two experiments at once would load the stand together (effect on results).
   * The parallel requests are made inside a test.
   */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* A retry would hide errors and send extra requests to the stand */
  retries: 0,
  workers: 1,
  /* CI: progress in the log + annotations in GitHub + HTML report for the artifact */
  reporter: process.env.CI
    ? [
        ['list'],
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report-perf' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report-perf' }],
      ],

  /* Time for one test together with its fixtures, default 30 seconds */
  timeout: 5 * 60000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /*
     * Off: a trace records every request and adds its own time to the measurements.
     * The numbers are printed to the console by the test itself.
     */
    trace: 'off',
  },

  /* The API stand, no browser */
  projects: [
    {
      name: 'performance',
      use: { baseURL: STAND_API_URL },
    },
  ],
});
