import { describe, expect, it } from 'vitest';

import { computeGridTemplate, isBelowBreakpoint } from '../src/AppShell';

describe('computeGridTemplate — column layout', () => {
  it('renders a single column when nothing but main is present', () => {
    const t = computeGridTemplate({
      layout: 'default',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: false,
      hasSidebar: false,
      hasAside: false,
      hasFooter: false,
      sidebarWidthPx: 260,
      asideWidthPx: 320,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateColumns).toBe('1fr');
    expect(t.gridTemplateAreas).toBe('"main"');
  });

  it('places sidebar in the start column when sidebarPosition=start', () => {
    const t = computeGridTemplate({
      layout: 'default',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: false,
      hasSidebar: true,
      hasAside: false,
      hasFooter: false,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateColumns).toBe('200px 1fr');
    expect(t.gridTemplateAreas).toBe('"sidebar main"');
  });

  it('places sidebar in the end column when sidebarPosition=end', () => {
    const t = computeGridTemplate({
      layout: 'default',
      sidebarPosition: 'end',
      asidePosition: 'end',
      hasHeader: false,
      hasSidebar: true,
      hasAside: false,
      hasFooter: false,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateColumns).toBe('1fr 200px');
    expect(t.gridTemplateAreas).toBe('"main sidebar"');
  });

  it('renders [sidebar main aside] when both panels are present', () => {
    const t = computeGridTemplate({
      layout: 'default',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: false,
      hasSidebar: true,
      hasAside: true,
      hasFooter: false,
      sidebarWidthPx: 240,
      asideWidthPx: 320,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateColumns).toBe('240px 1fr 320px');
    expect(t.gridTemplateAreas).toBe('"sidebar main aside"');
  });
});

describe('computeGridTemplate — layout variants with header', () => {
  it('default layout: header occupies main column only; sidebar spans header row visually', () => {
    const t = computeGridTemplate({
      layout: 'default',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: true,
      hasSidebar: true,
      hasAside: false,
      hasFooter: false,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateAreas).toBe('"sidebar header" "sidebar main"');
    expect(t.gridTemplateRows).toBe('56px 1fr');
  });

  it('inset layout: header spans every column', () => {
    const t = computeGridTemplate({
      layout: 'inset',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: true,
      hasSidebar: true,
      hasAside: false,
      hasFooter: false,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateAreas).toBe('"header header" "sidebar main"');
  });

  it('inset layout + aside: header spans all three columns', () => {
    const t = computeGridTemplate({
      layout: 'inset',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: true,
      hasSidebar: true,
      hasAside: true,
      hasFooter: false,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 60,
    });
    expect(t.gridTemplateAreas).toBe('"header header header" "sidebar main aside"');
    expect(t.gridTemplateRows).toBe('60px 1fr');
  });
});

describe('computeGridTemplate — footer', () => {
  it('default layout: footer occupies main column only', () => {
    const t = computeGridTemplate({
      layout: 'default',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: true,
      hasSidebar: true,
      hasAside: false,
      hasFooter: true,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateAreas).toBe(
      '"sidebar header" "sidebar main" "sidebar footer"',
    );
    expect(t.gridTemplateRows).toBe('56px 1fr auto');
  });

  it('inset layout: footer spans every column', () => {
    const t = computeGridTemplate({
      layout: 'inset',
      sidebarPosition: 'start',
      asidePosition: 'end',
      hasHeader: true,
      hasSidebar: true,
      hasAside: false,
      hasFooter: true,
      sidebarWidthPx: 200,
      asideWidthPx: 300,
      headerHeightPx: 56,
    });
    expect(t.gridTemplateAreas).toBe(
      '"header header" "sidebar main" "footer footer"',
    );
  });
});

describe('isBelowBreakpoint', () => {
  it('returns true for viewports below md (768)', () => {
    expect(isBelowBreakpoint(640, 'md')).toBe(true);
    expect(isBelowBreakpoint(767, 'md')).toBe(true);
    expect(isBelowBreakpoint(768, 'md')).toBe(false);
    expect(isBelowBreakpoint(1024, 'md')).toBe(false);
  });

  it('handles sm / lg / xl thresholds', () => {
    expect(isBelowBreakpoint(639, 'sm')).toBe(true);
    expect(isBelowBreakpoint(640, 'sm')).toBe(false);

    expect(isBelowBreakpoint(1023, 'lg')).toBe(true);
    expect(isBelowBreakpoint(1024, 'lg')).toBe(false);

    expect(isBelowBreakpoint(1279, 'xl')).toBe(true);
    expect(isBelowBreakpoint(1280, 'xl')).toBe(false);
  });
});