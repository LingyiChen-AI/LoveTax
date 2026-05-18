import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:30001',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:30001',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      DATABASE_URL: 'postgres://zchat:zchat@localhost:5433/zchat_test',
      AUTH_SECRET: 'test-secret-test-secret-test-secret',
      AUTH_URL: 'http://localhost:30001',
      APP_URL: 'http://localhost:30001',
      SMTP_HOST: 'localhost',
      SMTP_PORT: '1026',
      SMTP_FROM: 'zchat <no-reply@test.local>'
    }
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
