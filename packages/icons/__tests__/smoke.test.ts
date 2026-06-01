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