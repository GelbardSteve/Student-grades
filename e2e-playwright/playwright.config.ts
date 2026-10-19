import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './specs',
  globalTeardown: './global-teardown.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    video: 'retain-on-failure',
    screenshot: 'on-first-failure',

    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    testIdAttribute: 'data-test-specifier',
    headless: true,
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    ...devices['Desktop Chrome'],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    { 
      name: 'adminTests',
      testMatch: ['**/*.spec.ts'],
      dependencies: ['setup'],
      use: { storageState: 'auth.json' },
    },
    { name: 'firefox', use: {...devices['Desktop Firefox']}, default: false },
    { name: 'webkit', use: {...devices['Desktop Safari']}, default: false },
  ],

  /* The React app (reactApp: npm start), the local Supabase stack (npm run db:start) and the Edge Functions
     (npm run functions:serve) must already be running. This starts the mock email provider they send through. */
  webServer: {
    command: 'node scripts/mockEmailProvider.mjs',
    port: 4010,
    reuseExistingServer: true,
  },
});
