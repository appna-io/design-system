/**
 * Dark-mode brand-direction contract for every registered template.
 *
 * ## What this catches
 *
 * A brand colour used as a **fill** sits on a light ground in light mode and a dark ground in
 * dark mode. To hold the same relationship to its background it has to move *lighter* going into
 * dark. A palette that moves it darker leaves the brand muddy or invisible on the dark ground —
 * the identity dies even though nothing errors.
 *
 * No contrast check catches this. A dark green on near-black can still clear 8:1 while looking
 * nothing like the brand. It is an identity failure, not an accessibility one, which is why it
 * needs its own assertion.
 *
 * ## Why it asserts the mode BEFORE it asserts the colour
 *
 * This test exists because of a bug in its author's first attempt at the same measurement. That
 * harness labelled its samples by the `colorScheme` it *requested*, and `vantage-studio` carries
 * `preferredMode: 'dark'` — so its scope opened dark regardless and both samples were the dark
 * palette, one of them mislabelled "light". The result was a confident, wrong bug report against
 * a correct file.
 *
 * So the order here is load-bearing: read the scope's resolved `data-mode`, fail loudly if it
 * isn't the mode we asked for, and only then compare colours. An instrument that doesn't verify
 * what it sampled will eventually report the instrument's own error as a finding.
 *
 * ## Dark-first templates invert the rule
 *
 * For a template with `preferredMode: 'dark'` the dark palette is the authored one and the light
 * palette is the derived counterpart, so the expected direction flips. The test detects this from
 * the mode the template actually opens in rather than from a hardcoded list.
 */
import { expect, test, type Page } from '@playwright/test';

/** Relative luminance per WCAG 2.x, from a `#rrggbb` or `rgb()` string. */
function luminance(color: string): number {
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i);
  let rgb: number[];
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  } else {
    const parts = color.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return Number.NaN;
    rgb = parts.slice(0, 3).map(Number);
  }
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function templateSlugs(page: Page): Promise<string[]> {
  await page.goto('/templates', { waitUntil: 'domcontentloaded' });
  const hrefs = await page.$$eval('a[href^="/templates/"]', (as) =>
    as.map((a) => a.getAttribute('href') ?? ''),
  );
  const slugs = new Set<string>();
  for (const href of hrefs) {
    const slug = href.replace(/^\/templates\//, '').split(/[?#]/)[0];
    if (slug) slugs.add(slug);
  }
  return [...slugs].sort();
}

interface Sample {
  /** The mode the SCOPE resolved to — the element whose colour we read. */
  scopeMode: string | null;
  /** The root's mode — proves the browser context itself loaded as requested. */
  rootMode: string | null;
  primary: string;
}

async function sample(page: Page, slug: string, expected: 'light' | 'dark'): Promise<Sample> {
  await page.goto(`/templates/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-apx-theme-scope][data-mode]', { timeout: 30_000 });

  // Wait on the SCOPE's own mode, not the root's.
  //
  // The palette is applied to the scope after hydration, so an immediate read returns the
  // server-rendered variables in *both* contexts — identical values, which this test would then
  // read as "no direction to assert" and skip. That is not hypothetical: it skipped six of eight
  // templates on the first run and all eight on the second, and only the floor assertion below
  // stopped it reporting green while checking nothing.
  //
  // Waiting on `<html>` is not enough either: the root flips before the scope re-resolves, so the
  // wait returns while the scope still holds its old values. The scope is the element whose
  // colour we read, so it has to be the element we wait on.
  await page
    .waitForFunction(
      (want) => document.querySelector('[data-apx-theme-scope]')?.getAttribute('data-mode') === want,
      expected,
      { timeout: 10_000 },
    )
    .catch(() => {
      /* A template that pins its own mode never reaches `expected`. Reported below, not thrown. */
    });

  return page.evaluate(() => {
    const scope = document.querySelector('[data-apx-theme-scope]')!;
    return {
      scopeMode: scope.getAttribute('data-mode'),
      rootMode: document.documentElement.getAttribute('data-mode'),
      primary: getComputedStyle(scope).getPropertyValue('--sds-palette-primary-main').trim(),
    };
  });
}

test.describe('templates — dark-mode brand direction', () => {
  // Eight templates × two browser contexts, each a full page load against a dev server: ~70s in
  // practice, well past Playwright's 30s per-test default. The config's `timeout` is the
  // web-server budget, not the per-test one.
  //
  // Worth spelling out because of how it fails: the run dies inside `waitForFunction` and reports
  // "the scope never resolved to dark" — i.e. it looks exactly like the theming bug this spec was
  // written to detect. An instrument whose timeout is indistinguishable from its finding is worse
  // than no instrument, which is the same trap that produced #10.
  test.setTimeout(180_000);

  test('every template lifts its brand fill going into dark mode', async ({ browser }) => {
    const probe = await browser.newPage();
    const slugs = await templateSlugs(probe);
    await probe.close();

    expect(slugs.length, 'no templates discovered — the gallery scrape is broken').toBeGreaterThan(0);

    const failures: string[] = [];
    const compared: string[] = [];
    const skipped: string[] = [];

    for (const slug of slugs) {
      const lightCtx = await browser.newContext({ colorScheme: 'light' });
      const darkCtx = await browser.newContext({ colorScheme: 'dark' });
      const light = await sample(await lightCtx.newPage(), slug, 'light');
      const dark = await sample(await darkCtx.newPage(), slug, 'dark');
      await lightCtx.close();
      await darkCtx.close();

      // ── Instrument check, before any colour comparison ────────────────────────────────────
      // Prove the two browser contexts really loaded as light and dark. Without this the whole
      // comparison is unfalsifiable — which is exactly how the first version of this measurement
      // produced a confident, wrong bug report against a correct file.
      expect(light.rootMode, `${slug}: asked for light, root resolved to "${light.rootMode}"`).toBe(
        'light',
      );
      expect(dark.rootMode, `${slug}: asked for dark, root resolved to "${dark.rootMode}"`).toBe(
        'dark',
      );

      // A template that pins its own mode (`preferredMode`) keeps its scope in that mode in both
      // contexts, so the page only ever exposes one of its two palettes. Legitimate — but this
      // harness cannot read the other one and must not pretend the single palette it has is a
      // direction. Detected from the scope's resolved mode disagreeing with the context, which is
      // precisely the condition that fooled the earlier attempt.
      if (light.scopeMode !== 'light' || dark.scopeMode !== 'dark') {
        skipped.push(`${slug} (scope pinned to ${light.scopeMode})`);
        continue;
      }

      // ── The actual assertion ──────────────────────────────────────────────────────────────
      const lightL = luminance(light.primary);
      const darkL = luminance(dark.primary);
      if (Number.isNaN(lightL) || Number.isNaN(darkL)) {
        failures.push(`${slug}: could not parse primary (${light.primary} / ${dark.primary})`);
        continue;
      }

      // A small tolerance: a template may legitimately keep one brand value across both modes
      // (halyard does), and that is not a direction error.
      compared.push(slug);

      if (darkL < lightL - 0.02) {
        failures.push(
          `${slug}: primary gets DARKER in dark mode — ` +
            `${light.primary} (L ${lightL.toFixed(3)}) → ${dark.primary} (L ${darkL.toFixed(3)}). ` +
            `A brand fill on a dark ground has to lift, or the identity disappears.`,
        );
      }
    }

    // A guard that skips everything passes while asserting nothing — the same trap as a test with
    // an early return. Most templates must actually have been compared for this to mean anything.
    // eslint-disable-next-line no-console
    console.log(`compared ${compared.length}: ${compared.join(', ')}`);
    if (skipped.length) {
      // eslint-disable-next-line no-console
      console.log(`skipped ${skipped.length}: ${skipped.join(', ')}`);
    }
    expect(
      compared.length,
      `only ${compared.length} of ${slugs.length} templates were actually compared — the harness is skipping too much to be a guard`,
    ).toBeGreaterThanOrEqual(Math.ceil(slugs.length / 2));

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
