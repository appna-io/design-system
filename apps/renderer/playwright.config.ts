/**
 * Playwright config for the renderer's visual-snapshot suite.
 *
 * The suite boots the renderer's production build (`pnpm next start`) so the
 * snapshots match what end-users see, not the dev-build with extra DevTools
 * scaffolding. The first run generates the baseline PNGs under
 * `tests/visual.spec.ts-snapshots/`; subsequent runs compare against them.
 *
 * Run locally:
 *   pnpm --filter @apx-ui/renderer build              # rebuild app
 *   pnpm --filter @apx-ui/renderer test:visual        # compare
 *   pnpm --filter @apx-ui/renderer test:visual:update # regenerate
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3010);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  /* Threshold tuned for the DataGrid matrix — antialiasing on borders varies
   * across OS / GPU combos; 1 % pixel-diff with 0.2 max-channel delta keeps the
   * suite signal-rich without being flaky. */
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    /* Fix the viewport + DPR so snapshots are stable. */
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
