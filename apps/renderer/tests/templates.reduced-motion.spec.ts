/**
 * Reduced-motion contract for every registered template.
 *
 * The workspace rule is that templates animate throughout — which makes
 * `prefers-reduced-motion` the failure mode nobody sees. A scroll reveal renders its `initial`
 * state (typically `opacity: 0`) and waits for a viewport trigger; if the reduced-motion path
 * ever stops short-circuiting to a plain element, that trigger never arrives and the content is
 * invisible **forever**, for exactly the users who opted out of motion. It looks perfect in every
 * screenshot, so only an assertion catches it.
 *
 * Two deliberate narrowings keep this signal-rich:
 *
 *  - **Inline styles only** for the stalled-reveal check. Motion writes to `el.style`; a
 *    designer's `opacity-80` lives in a stylesheet, and reading computed style there would flag
 *    every intentionally-dimmed caption on the page. CSS-driven motion is covered separately by
 *    `findUncancelledMotion`, which reads computed style but only for elements that have already
 *    declared they cancel — so it stays free of false positives.
 *  - **Closed overlays are skipped.** A shut `Select` listbox or `Menu` panel is *correctly* at
 *    `opacity: 0` — that is the closed state, not a stalled reveal.
 *
 * This runs against the production build (see `playwright.config.ts`). That matters: in dev, a
 * cold route compile can leave React's server-rendered `initial` styles in place well past
 * `networkidle`, which reads as a failure and is only a dev-server artifact.
 */
import { expect, test, type Page } from '@playwright/test';

/**
 * An element whose class list promises to cancel its own motion under `prefers-reduced-motion`,
 * but whose computed style says otherwise.
 */
interface UncancelledMotion {
  section: string;
  tag: string;
  classes: string;
  transitionDuration: string;
  animationName: string;
}

interface StuckElement {
  section: string;
  tag: string;
  opacity: string;
  transform: string;
  text: string;
}

/** Every template the gallery links to — so a newly registered template is covered for free. */
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

/**
 * The other half of the reduced-motion contract, and the half `findStuck` cannot see.
 *
 * `findStuck` reads **inline** styles, so it covers JS-driven motion — a reveal stalled at
 * `opacity: 0`. CSS-driven motion lives in the stylesheet and never appears there, so this covers
 * the other half: any element whose class list *claims* to cancel its motion must actually
 * compute to cancelled.
 *
 * ## What this is and isn't a guard against
 *
 * The DS cancels CSS motion twice over, and which layer is actually load-bearing depends on the
 * consumer.
 *
 * Per-component classes (`transition-transform ... motion-reduce:transition-none`) are two rules
 * of equal specificity, so the cancel wins only by being emitted later — an ordering nothing in
 * our source guarantees. `reset.css` also carries a global `prefers-reduced-motion` block with
 * `!important`, which wins regardless of that ordering — **but importing it is opt-in.** For a
 * consumer who skips the reset, those per-component classes are not redundant at all: they are
 * the only thing doing the job, and the ordering they depend on is a live hazard.
 *
 * These templates do import the reset, so what this check verifies *here* is the reset holding.
 * That is still the assertion worth having, because the reset is the single point of failure the
 * per-component classes exist to back up — and it is the only assertion in this file that reads
 * **computed** style, so it is what would catch the reset being scoped down, dropped or
 * overridden.
 */
function findUncancelledMotion(page: Page): Promise<UncancelledMotion[]> {
  return page.evaluate(() => {
    const out: UncancelledMotion[] = [];

    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[class]'))) {
      const classes = el.className;
      if (typeof classes !== 'string') continue;

      const cancelsTransition = classes.includes('motion-reduce:transition-none');
      const cancelsAnimation = classes.includes('motion-reduce:animate-none');
      if (!cancelsTransition && !cancelsAnimation) continue;

      const computed = getComputedStyle(el);
      const durations = computed.transitionDuration
        .split(',')
        .map((d) => Number.parseFloat(d.trim()) || 0);

      // Not `> 0`. The standard way to kill a transition is `0.001ms`, not `0s` — a true zero can
      // stop `transitionend` from firing at all and strand any code waiting on it, so the reset
      // sheet uses the near-zero idiom. That computes to `1e-06s`, which is greater than zero and
      // would flag every correctly-cancelled element on the page.
      //
      // An instrument that flags everything is worse than none: during the `motion-safe:` sweep it
      // would have someone deleting correct `motion-reduce:` classes to make it quiet.
      const CANCELLED_BELOW_SECONDS = 0.001;

      const stillTransitions =
        cancelsTransition && durations.some((d) => d >= CANCELLED_BELOW_SECONDS);
      // Same reasoning for animations, and `animation-name` is the wrong thing to read: the reset
      // neuters an animation by duration and iteration count, leaving the name in place. An
      // element with a live name and a 1e-06s duration is not animating.
      const animDurations = computed.animationDuration
        .split(',')
        .map((d) => Number.parseFloat(d.trim()) || 0);
      const stillAnimates =
        cancelsAnimation &&
        computed.animationName !== 'none' &&
        animDurations.some((d) => d >= CANCELLED_BELOW_SECONDS);

      if (stillTransitions || stillAnimates) {
        out.push({
          section: el.closest('[data-inspect-id]')?.getAttribute('data-inspect-id') ?? '(page)',
          tag: el.tagName,
          classes: classes.slice(0, 120),
          transitionDuration: computed.transitionDuration,
          animationName: computed.animationName,
        });
      }
    }

    return out;
  });
}

function findStuck(page: Page): Promise<StuckElement[]> {
  return page.evaluate(() => {
    const out: StuckElement[] = [];

    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[style]'))) {
      // A closed overlay is legitimately transparent — that IS its closed state.
      if (el.closest('[role="listbox"], [role="menu"], [role="dialog"], [data-state="closed"]')) {
        continue;
      }
      if (el.getAttribute('aria-hidden') === 'true') continue;

      const opacity = el.style.opacity;
      const transform = el.style.transform;

      const faded = opacity !== '' && Number.parseFloat(opacity) < 0.99;
      const displaced =
        transform !== '' && transform !== 'none' && !/^translateZ\(0(px)?\)$/.test(transform);

      if (faded || displaced) {
        out.push({
          section: el.closest('[data-inspect-id]')?.getAttribute('data-inspect-id') ?? '(page)',
          tag: el.tagName,
          opacity: opacity || '(unset)',
          transform: transform || '(unset)',
          text: (el.textContent ?? '').trim().slice(0, 70),
        });
      }
    }
    return out;
  });
}

test.describe('templates — reduced motion', () => {
  /**
   * The context is built by hand rather than through `test.use({ reducedMotion })` so the
   * emulation is pinned to this spec regardless of the installed Playwright's option typings,
   * and so `baseURL` is carried over explicitly from the project config.
   */
  test('no template leaves content hidden when motion is reduced', async ({ browser, baseURL }) => {
    // Playwright's per-test default is 30s, and the `timeout: 120_000` in `playwright.config.ts`
    // is the **webServer** budget, not this one. This walks every registered template a viewport
    // at a time with a settle between steps — the scroll is not optional, since a reveal only
    // proves itself once it has been scrolled past — so the wall-clock grows with the gallery and
    // is already well past 30s at eight templates.
    //
    // Worth stating because of how it fails: a timeout here surfaces as whatever assertion
    // happened to be mid-flight, which reads as a real reduced-motion failure and is not one.
    // The same shape of lie sent someone down a two-hour dead end on a palette bug this session.
    test.setTimeout(240_000);

    const context = await browser.newContext({
      reducedMotion: 'reduce',
      ...(baseURL ? { baseURL } : {}),
    });
    const page = await context.newPage();
    const slugs = await templateSlugs(page);
    expect(slugs.length, 'gallery should link at least one template').toBeGreaterThan(0);

    const failures: string[] = [];

    for (const slug of slugs) {
      await page.goto(`/templates/${slug}`, { waitUntil: 'networkidle' });

      // Walk the whole page: a reveal only proves itself once it has been scrolled past.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);

      for (const s of await findStuck(page)) {
        failures.push(
          `${slug} [${s.section}] <${s.tag}> opacity=${s.opacity} transform=${s.transform} :: "${s.text}"`,
        );
      }

      for (const m of await findUncancelledMotion(page)) {
        failures.push(
          `${slug} [${m.section}] <${m.tag}> claims motion-reduce cancel but computes ` +
            `transition-duration=${m.transitionDuration} animation-name=${m.animationName} :: ${m.classes}`,
        );
      }
    }

    await context.close();

    expect(failures, `Hidden under reduced motion:\n${failures.join('\n')}`).toEqual([]);
  });
});
