/**
 * Visual snapshot suite for `<DataGrid />` — fulfils Phase 27 PR 8 task #29.
 *
 * Matrix: 4 variants × 7 colors × 3 densities × {LTR, RTL} = 168 snapshots.
 *
 * The renderer exposes a snapshot harness at `/visual-matrix/data-grid` that
 * mounts every cell with a stable `[data-visual-cell="variant/color/density/dir"]`
 * wrapper. We iterate the wrappers, wait for fonts + the table layout to settle,
 * and snapshot each cell's bounding box.
 *
 * Baselines live under `tests/data-grid.visual.spec.ts-snapshots/`. Regenerate
 * with `pnpm test:visual:update`.
 */

import { expect, test } from '@playwright/test';

const VARIANTS = ['solid', 'outline', 'striped', 'minimal'] as const;
const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const DENSITIES = ['compact', 'standard', 'comfortable'] as const;
const DIRECTIONS = ['ltr', 'rtl'] as const;

const cells = DIRECTIONS.flatMap((dir) =>
  VARIANTS.flatMap((variant) =>
    COLORS.flatMap((color) =>
      DENSITIES.map((density) => ({ dir, variant, color, density })),
    ),
  ),
);

test.describe('DataGrid — visual matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visual-matrix/data-grid');
    // Wait for the very last cell to mount so we know every grid finished rendering.
    await page
      .locator('[data-visual-cell="minimal/neutral/comfortable/rtl"]')
      .waitFor({ state: 'visible', timeout: 30_000 });
    // Settle web fonts — DataGrid borders pick up sub-pixel shifts otherwise.
    await page.evaluate(() => document.fonts.ready);
  });

  for (const { dir, variant, color, density } of cells) {
    const key = `${variant}/${color}/${density}/${dir}`;
    test(key, async ({ page }) => {
      const cell = page.locator(`[data-visual-cell="${key}"]`);
      await expect(cell).toHaveScreenshot(`${variant}-${color}-${density}-${dir}.png`, {
        animations: 'disabled',
      });
    });
  }
});

test('matrix cell count is exactly 168', async ({ page }) => {
  await page.goto('/visual-matrix/data-grid');
  const count = await page.locator('[data-visual-cell]').count();
  expect(count).toBe(168);
});
