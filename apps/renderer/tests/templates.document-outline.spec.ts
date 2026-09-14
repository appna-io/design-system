/**
 * Document-outline and inline-a11y contract for every registered template.
 *
 * Named for what it checks rather than for what it started as: this began as a heading-outline
 * guard and absorbed Templater's parallel spec, so it now also covers flow content inside
 * headings, images with no `alt`, and links with no accessible name. The old name (`…headings…`)
 * had it flagged for deletion twice in five minutes as "the superseded one" — it is the surviving
 * merged spec and the only outline guard there is.
 *
 * ## The bug this exists for
 *
 * `relay-atelier` shipped with **no `<h1>` at all**. Its hero is three lines that stagger in
 * reading order, so each line was its own element — and every one of them was a `<span>`. The
 * page's entire argument, the largest type in the gallery, was invisible to the document outline;
 * a screen-reader user landing on it got no page title.
 *
 * ## Why it needs a browser test rather than a grep
 *
 * Nothing was wrong in the source. There was no incorrect `as="h1"` to find — there was simply
 * nothing there, and an absence has no string to match. `grep 'as="h1"'` returns zero hits for a
 * template that correctly has one buried in a shared component, and zero hits for one that has
 * none at all; the two are indistinguishable from the file. The rendered outline is the only place
 * the difference exists.
 *
 * That is the third failure of this shape in this repo: the derived dark palette, the default
 * palette's hover states, and this. In every case the code read correctly and only the output was
 * wrong. Hence a spec that reads the output.
 *
 * ## What it asserts
 *
 * 1. **Exactly one `<h1>`.** Zero means the page has no title. More than one means several
 *    competing titles, which is the same failure in the other direction — a template that puts an
 *    `h1` on each of three hero lines passes a naive "has an h1" check and still lies.
 * 2. **No skipped levels.** `h2` → `h4` breaks the nesting a screen reader navigates by, and it
 *    is the usual consequence of choosing a heading tag for its *size* rather than its depth.
 *    The DS separates those (`SectionHeading`'s `size` and `level` are independent props) which
 *    makes the mistake avoidable — but only if something checks.
 * 3. **No empty headings.** A heading with no accessible text is a landmark that announces
 *    nothing, and it is what you get when a decorative element is given a heading tag.
 *
 * Deliberately **not** asserted: that the `h1` matches any particular copy. A template is free to
 * title itself however it likes; what it is not free to do is have no title.
 */
import { expect, test, type Page } from '@playwright/test';

interface Heading {
  level: number;
  text: string;
  /** A heading may contain phrasing content only; a `<div>` inside one is invalid markup. */
  hasFlowContent: boolean;
}

/** Structural facts gathered from the same scope, in the same pass. */
interface Structure {
  headings: Heading[];
  imagesMissingAlt: number;
  namelessLinks: number;
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

/**
 * Headings in document order, from the template only.
 *
 * Scoped to `[data-apx-theme-scope]` on purpose: the preview chrome (toolbar, inspector banner,
 * source modal) lives outside it, and a heading the docs shell renders is not the template's to
 * answer for. Without the scope this test would measure the renderer, not the gallery.
 */
async function structure(page: Page, slug: string): Promise<Structure> {
  await page.goto(`/templates/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-apx-theme-scope]', { timeout: 30_000 });
  return page.evaluate(() => {
    const scope = document.querySelector('[data-apx-theme-scope]')!;
    return {
      headings: [...scope.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((el) => ({
        level: Number(el.tagName.slice(1)),
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
        hasFlowContent: el.querySelector('div, p, section, ul, ol') !== null,
      })),
      imagesMissingAlt: [...scope.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt'))
        .length,
      namelessLinks: [...scope.querySelectorAll('a')].filter(
        (a) => !(a.textContent ?? '').trim() && !a.getAttribute('aria-label'),
      ).length,
    };
  });
}

test.describe('templates — document outline', () => {
  test('every template has exactly one h1, no skipped levels, no empty headings', async ({
    browser,
  }) => {
    const probe = await browser.newPage();
    const slugs = await templateSlugs(probe);
    await probe.close();

    expect(slugs.length, 'no templates discovered — the gallery scrape is broken').toBeGreaterThan(
      0,
    );

    const failures: string[] = [];

    for (const slug of slugs) {
      const page = await browser.newPage();
      const report = await structure(page, slug);
      const found = report.headings;
      await page.close();

      const h1s = found.filter((h) => h.level === 1);
      if (h1s.length !== 1) {
        failures.push(
          `${slug}: ${h1s.length} <h1> (expected exactly 1) — outline was ` +
            `[${found.map((h) => h.level).join(', ')}]`,
        );
      }

      for (let i = 1; i < found.length; i += 1) {
        const prev = found[i - 1]!;
        const here = found[i]!;
        if (here.level - prev.level > 1) {
          failures.push(
            `${slug}: heading level jumps h${prev.level} → h${here.level} ` +
              `("${prev.text.slice(0, 40)}" → "${here.text.slice(0, 40)}")`,
          );
        }
      }

      for (const heading of found) {
        if (heading.text === '') {
          failures.push(`${slug}: an h${heading.level} has no text content`);
        }
        if (heading.hasFlowContent) {
          failures.push(
            `${slug}: an h${heading.level} contains flow content ` +
              `("${heading.text.slice(0, 40)}") — headings take phrasing content only, and a ` +
              '`<div>` inside one usually means a layout wrapper landed where a `<span>` belonged',
          );
        }
      }

      if (report.imagesMissingAlt > 0) {
        failures.push(
          `${slug}: ${report.imagesMissingAlt} <img> with no alt attribute — decorative images ` +
            'must say so explicitly with alt=""',
        );
      }
      if (report.namelessLinks > 0) {
        failures.push(
          `${slug}: ${report.namelessLinks} link(s) with no accessible name — an icon-only link ` +
            'needs an aria-label',
        );
      }
    }

    expect(failures.join('\n'), `document-outline failures:\n${failures.join('\n')}`).toBe('');
  });
});
