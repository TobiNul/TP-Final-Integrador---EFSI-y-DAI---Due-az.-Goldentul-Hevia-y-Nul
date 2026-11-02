import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5175', headless: true, screenshot: 'only-on-failure' },
  webServer: [
    {
      command: 'node ../backend/scripts/browser-fixture.js',
      url: 'http://127.0.0.1:3099/api/health',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort',
      url: 'http://127.0.0.1:5175',
      env: { API_PROXY_TARGET: 'http://127.0.0.1:3099' },
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
