// Playwright Configuration - SLOW MODE (avoids rate limiting)
// Use this for running full test suites with delays between tests

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/e2e',
  timeout: 60000, // 60 second timeout per test
  expect: {
    timeout: 10000
  },

  // Run tests serially with delays
  fullyParallel: false,
  workers: 1, // One test at a time

  // Retry failed tests
  retries: process.env.CI ? 2 : 1,

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Slower action timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...require('@playwright/test').devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup to add delays between tests
  globalSetup: require.resolve('./test/config/slow-setup.js'),

  // Global teardown to clean up test data
  globalTeardown: require.resolve('./test/config/slow-teardown.js'),
});
