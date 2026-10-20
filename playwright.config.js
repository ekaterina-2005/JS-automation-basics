// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';

// The container is created with `docker create`
const JUICE_SHOP_CONTAINER = 'juice-shop';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/*
 * Only the main process stops the container, when the whole run is finished.
 * Playwright stops only the `docker start` process, the container itself keeps running.
 */
if (!process.env.TEST_WORKER_INDEX) {
  stopJuiceShop(); // Before the run
  process.on('exit', stopJuiceShop); // After the run
}

function stopJuiceShop() {
  try {
    execSync(`docker stop -t 2 ${JUICE_SHOP_CONTAINER}`, { stdio: 'ignore' });
  } catch {
    // The container is already stopped
  }
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  /* All tests use one local server, 8 parallel browsers overload the machine */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],

  /* Server can answer later than the default 5 seconds when several browsers run in parallel */
  expect: { timeout: 15000 },
  /* Time for one test together with its fixtures, default 30 seconds */
  timeout: 60000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    /* API tests use request and do not start a browser, so one project is enough */
    {
      name: 'api',
      testDir: './tests/api',
    },

    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Juice Shop creates its database again on every start, so each run begins without old test users
    command: `docker start --attach ${JUICE_SHOP_CONTAINER}`,
    url: 'http://localhost:3000',
    reuseExistingServer: false,
  },
});
