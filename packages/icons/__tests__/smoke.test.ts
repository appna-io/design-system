import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { ICON_MANIFEST, ChevronDown, createIcon } from '../src';

describe('@apx-ui/icons package shape', () => {
  it('exposes every manifest entry as a working component with stable metadata', () => {
    expect(ICON_MANIFEST.length).toBeGreaterThan(0);

    for (const entry of ICON_MANIFEST) {
      expect(entry.Component.iconName).toBe(entry.name);
      expect(entry.Component.displayName).toBe(entry.name);

      const html = renderToStaticMarkup(createElement(entry.Component));
      expect(html.startsWith('<svg')).toBe(true);
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('stroke="currentColor"');
      // Decorative (no title) → must hide from assistive tech.
      expect(html).toContain('aria-hidden="true"');
    }
  });

  it('manifest entries are alphabetically ordered by name', () => {
    const names = ICON_MANIFEST.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('every manifest entry carries lowercase, non-empty keywords for search', () => {
    for (const entry of ICON_MANIFEST) {
      expect(entry.keywords.length).toBeGreaterThan(0);
      for (const kw of entry.keywords) {
        expect(kw).toBe(kw.toLowerCase());
        expect(kw.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe('icon prop API', () => {
  it('emits role/aria-label/<title> when `title` is provided', () => {
    const html = renderToStaticMarkup(createElement(ChevronDown, { title: 'Open menu' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain('<title>Open menu</title>');
    expect(html).not.toContain('aria-hidden');
  });

  it('honours numeric and string `size` values', () => {
    const numeric = renderToStaticMarkup(createElement(ChevronDown, { size: 32 }));
    expect(numeric).toContain('width="32"');
    expect(numeric).toContain('height="32"');

    const relative = renderToStaticMarkup(createElement(ChevronDown, { size: '1.5em' }));
    expect(relative).toContain('width="1.5em"');
    expect(relative).toContain('height="1.5em"');
  });

  it('passes className, style, and tabIndex through to the underlying <svg>', () => {
    const html = renderToStaticMarkup(
      createElement(ChevronDown, {
        className: 'text-primary',
        style: { color: 'red' },
        tabIndex: -1,
      }),
    );
    expect(html).toContain('class="text-primary"');
    expect(html).toContain('color:red');
    expect(html).toContain('tabindex="-1"');
  });
});

describe('createIcon factory', () => {
  it('produces components that round-trip through the public IconComponent contract', () => {
    const Custom = createIcon('Custom', createElement('path', { d: 'M0 0h24v24H0z' }));
    expect(Custom.iconName).toBe('Custom');
    expect(Custom.displayName).toBe('Custom');

    const html = renderToStaticMarkup(createElement(Custom, { title: 'Custom shape' }));
    expect(html).toContain('<title>Custom shape</title>');
    expect(html).toContain('d="M0 0h24v24H0z"');
  });
});

describe('icon snapshots (lock visual output)', () => {
  for (const entry of ICON_MANIFEST) {
    it(`renders ${entry.name} consistently`, () => {
      const html = renderToStaticMarkup(createElement(entry.Component));
      expect(html).toMatchSnapshot();
    });
  }
});

/**
 * Directional icons (#16). An arrow that means "next" points *left* in an RTL page. Left
 * un-mirrored it isn't merely ugly — it points at the previous item, so the control lies about
 * what it does.
 *
 * The mirroring itself is one CSS rule in `@apx-ui/theme`'s `styles/reset.css`; this package
 * only stamps the attribute it keys on, which is what lets `@apx-ui/icons` stay installable with
 * no design-system dependency. So what's testable here is the marking, and — more importantly —
 * that the marking is applied on *semantic* grounds rather than to anything arrow-shaped.
 */
describe('directional icons', () => {
  const DIRECTIONAL = ['ArrowRight', 'ChevronRight'];

  it('marks exactly the reading-order glyphs, and nothing else', () => {
    const marked = ICON_MANIFEST.filter((e) => e.directional).map((e) => e.name);
    expect(marked.sort()).toEqual([...DIRECTIONAL].sort());
  });

  it('stamps the attribute the reset rule keys on', () => {
    for (const entry of ICON_MANIFEST.filter((e) => e.directional)) {
      expect(renderToStaticMarkup(createElement(entry.Component))).toContain(
        'data-apx-icon-directional',
      );
    }
  });

  it('leaves every other icon unmarked', () => {
    for (const entry of ICON_MANIFEST.filter((e) => !e.directional)) {
      expect(
        renderToStaticMarkup(createElement(entry.Component)),
        entry.name,
      ).not.toContain('data-apx-icon-directional');
    }
  });

  it('does not mark glyphs that are merely handed rather than directional', () => {
    // `Search`, `Repeat` and `Scissors` have a visual handedness but mean the same thing either
    // way; `ExternalLink` / `ArrowUpRight` point *out of the page*, a fixed convention rather
    // than a position in the reading flow. Mirroring any of these is churn at best.
    const byName = Object.fromEntries(ICON_MANIFEST.map((e) => [e.name, e]));
    for (const name of ['Search', 'Repeat', 'Scissors', 'ExternalLink', 'ArrowUpRight']) {
      expect(byName[name]?.directional, name).toBeUndefined();
    }
  });

  it('defaults to non-directional, and opts in explicitly', () => {
    const Plain = createIcon('Plain', createElement('path', { d: 'M0 0h24' }));
    const Marked = createIcon('Marked', createElement('path', { d: 'M0 0h24' }), {
      directional: true,
    });
    expect(renderToStaticMarkup(createElement(Plain))).not.toContain('data-apx-icon-directional');
    expect(renderToStaticMarkup(createElement(Marked))).toContain('data-apx-icon-directional');
  });
});

