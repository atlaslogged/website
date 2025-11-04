const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright E2E Test Configuration
 * Tests the Atlas Logged roadmap website UI and interactions
 */
module.exports = defineConfig({
  testDir: './test/e2e',

  // Test execution settings
  fullyParallel: false, // Run tests sequentially to avoid conflicts
  forbidOnly: !!process.env.CI, // Fail CI if test.only is left in
  retries: process.env.CI ? 2 : 0, // Retry on CI
  workers: 1, // Single worker to avoid race conditions

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test/e2e-results/html' }],
    ['list'] // Console output
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:8000',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Trace on failure
    trace: 'on-first-retry',

    // Timeout for actions
    actionTimeout: 10000,
  },

  // Test timeout
  timeout: 30000,

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server configuration - start local server for tests
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
