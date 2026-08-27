const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './qa',
  testMatch: /e2e\.spec\.js/,
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  workers: 3,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'qa/reports/playwright-report.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 900 },
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off'
  },
  webServer: {
    command: 'python -m http.server 4173 -d .',
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: false,
    timeout: 10000
  }
});
