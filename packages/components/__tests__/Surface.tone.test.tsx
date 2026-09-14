import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/Button/Button';
import { Surface } from '../src/Surface/Surface';
import {
  invertedPaletteVars,
  primaryPaletteVars,
  secondaryPaletteVars,
  surfaceCaptureVars,
  toneNeedsCapture,
  tonePaletteVars,
} from '../src/Surface/Surface.tone';
import { renderWithTheme as render } from './utils';

/**
 * These tests are about the *token map*, not about pixels. jsdom does not resolve `var()` or
 * `color-mix()`, so asserting a computed colour would only assert that jsdom is jsdom. What is
 * actually worth pinning is the contract every consumer depends on:
 *
 *   1. the declarations a tone emits, and which roles it deliberately leaves alone,
 *   2. that the brand tones emit no custom-property cycle (the failure mode that makes a Surface
 *      silently render unstyled, and the whole reason `inverted` needs a capture element),
 *   3. that only `inverted` pays for that capture element,
 *   4. that `default` and `inverted` did not move when the brand tones were added.
 */

const SURFACE_ROLES = ['background', 'foreground', 'border', 'neutral'] as const;
const UNTOUCHED_ROLES = ['success', 'warning', 'danger', 'info'] as const;

function declaredVars(map: Record<string, unknown>): string[] {
  return Object.keys(map).filter((k) => k.startsWith('--'));
}

/** How much of the *first* colour a `color-mix()` keeps. */
function pct(value: string): number {
  return Number(/(\d+)%/.exec(value)![1]);
}

/** Every `--sds-…` custom property the map *reads* (the `var(--x)` references in its values). */
function referencedVars(map: Record<string, unknown>): string[] {
  const found = new Set<string>();
  for (const value of Object.values(map)) {
    for (const match of String(value).matchAll(/var\((--[\w-]+)/g)) found.add(match[1]!);
  }
  return [...found];
}

describe('Surface tone maps — the shared contract', () => {
  it.each([
    ['inverted', invertedPaletteVars],
    ['primary', primaryPaletteVars],
    ['secondary', secondaryPaletteVars],
  ])('%s remaps every surface role plus the focus ring', (_name, map) => {
    const declared = declaredVars(map as Record<string, unknown>);

    for (const role of SURFACE_ROLES) {
      expect(
        declared.some((v) => v.startsWith(`--sds-palette-${role}-`)),
        `expected the ${role} role to be remapped`,
      ).toBe(true);
    }
    expect(declared).toContain('--sds-focus-ring');
  });

  it.each([
    ['inverted', invertedPaletteVars],
    ['primary', primaryPaletteVars],
    ['secondary', secondaryPaletteVars],
  ])('%s leaves the status roles alone — a danger button stays red on any band', (_n, map) => {
    const declared = declaredVars(map as Record<string, unknown>);
    for (const role of UNTOUCHED_ROLES) {
      expect(declared.filter((v) => v.startsWith(`--sds-palette-${role}-`))).toEqual([]);
    }
  });

  it.each([
    ['primary', primaryPaletteVars],
    ['secondary', secondaryPaletteVars],
  ])('%s never redefines the brand role it reads — so it emits no cycle', (name, map) => {
    const record = map as Record<string, unknown>;
    const declared = new Set(declaredVars(record));

    // The cycle test, stated directly: nothing this map writes may also be something it reads.
    // If that ever became false the browser would drop *every* property in the cycle and the band
    // would render unstyled — which is precisely why `inverted` cannot do without its capture
    // element and why these tones can.
    for (const read of referencedVars(record)) {
      expect(declared.has(read), `${name} both declares and reads ${read}`).toBe(false);
    }

    // And what it reads is the brand role's own two slots, nothing else.
    expect(referencedVars(record).sort()).toEqual([
      `--sds-palette-${name}-contrast`,
      `--sds-palette-${name}-main`,
    ]);
  });

  it('inverted reads only the captured pair, which is what the capture element provides', () => {
    expect(referencedVars(invertedPaletteVars as Record<string, unknown>).sort()).toEqual([
      '--sds-surface-ink',
      '--sds-surface-paper',
    ]);
    expect(declaredVars(surfaceCaptureVars as Record<string, unknown>).sort()).toEqual([
      '--sds-surface-ink',
      '--sds-surface-paper',
    ]);
  });

  it('neutral is flipped so `color="neutral"` is the light control the band wants', () => {
    // The single assertion the CTA-band use case rests on: on a primary fill, the neutral role's
    // fill is the brand's contrast colour and its ink is the brand fill — i.e. a white button with
    // violet text. Templates used to write this by hand as an inline style.
    const map = primaryPaletteVars as Record<string, string>;
    expect(map['--sds-palette-neutral-main']).toBe('var(--sds-palette-primary-contrast)');
    expect(map['--sds-palette-neutral-contrast']).toBe('var(--sds-palette-primary-main)');
  });

  it('brand foreground fades keep more ink than inverted does', () => {
    // A brand fill is a mid-tone, so there is less contrast headroom than against near-black ink.
    // `inverted` can afford a 50% subtle step; on `#4f46e5` that lands around 2:1. Guarding the
    // relationship rather than the literal numbers, so a future retune cannot silently invert it.
    const brand = primaryPaletteVars as Record<string, string>;
    const inv = invertedPaletteVars as Record<string, string>;

    expect(pct(brand['--sds-palette-foreground-muted']!)).toBeGreaterThan(
      pct(inv['--sds-palette-foreground-muted']!),
    );
    expect(pct(brand['--sds-palette-foreground-subtle']!)).toBeGreaterThan(
      pct(inv['--sds-palette-foreground-subtle']!),
    );
  });

  it('a brand tone has no muted hierarchy — both softened steps are the same value', () => {
    // Not an accident and not a bug to tidy up later. ~6:1 at full ink is the entire budget on a
    // saturated fill; measured across the six real brand fills, anything below 90% drops body copy
    // under 4.5:1. Two token names resolving to one value is the honest encoding of that, and this
    // test is what stops someone "restoring the hierarchy" without re-measuring.
    for (const map of [primaryPaletteVars, secondaryPaletteVars] as Record<string, string>[]) {
      expect(map['--sds-palette-foreground-muted']).toBe(map['--sds-palette-foreground-subtle']);
      expect(pct(map['--sds-palette-foreground-muted']!)).toBeGreaterThanOrEqual(90);
    }
  });

  it('the meaningful borders sit far enough toward the ink to clear WCAG 1.4.11', () => {
    // `default` and `strong` are an input's edge and an outline button's ring — 1.4.11 asks 3:1 of
    // them. jsdom cannot resolve `color-mix`, so this guards the *blend direction and depth* that
    // the measurement fixed, not the ratio itself: keeping ≤40% of the ground is what produced
    // 3.14–8.58 across every real palette. `subtle` is a decorative hairline and is exempt.
    const cases: [string, Record<string, string>][] = [
      ['inverted', invertedPaletteVars as Record<string, string>],
      ['primary', primaryPaletteVars as Record<string, string>],
      ['secondary', secondaryPaletteVars as Record<string, string>],
    ];

    for (const [name, map] of cases) {
      for (const step of ['default', 'strong'] as const) {
        const value = map[`--sds-palette-border-${step}`]!;
        expect(
          pct(value),
          `${name} border-${step} keeps too much of the ground`,
        ).toBeLessThanOrEqual(55);
      }
      // And the scale still runs the right way: subtle is the quietest, strong the loudest.
      expect(pct(map['--sds-palette-border-subtle']!)).toBeGreaterThan(
        pct(map['--sds-palette-border-default']!),
      );
      expect(pct(map['--sds-palette-border-default']!)).toBeGreaterThan(
        pct(map['--sds-palette-border-strong']!),
      );
    }
  });
});

describe('Surface tone maps — the lookup', () => {
  it('default swaps nothing', () => {
    expect(tonePaletteVars.default).toBeUndefined();
  });

  it('every tone but default has a map', () => {
    expect(tonePaletteVars.inverted).toBe(invertedPaletteVars);
    expect(tonePaletteVars.primary).toBe(primaryPaletteVars);
    expect(tonePaletteVars.secondary).toBe(secondaryPaletteVars);
  });

  it('only inverted needs the capture element', () => {
    expect(toneNeedsCapture('inverted')).toBe(true);
    expect(toneNeedsCapture('primary')).toBe(false);
    expect(toneNeedsCapture('secondary')).toBe(false);
    expect(toneNeedsCapture('default')).toBe(false);
  });
});

describe('Surface — rendering', () => {
  it('default renders one element and sets no palette vars', () => {
    const { container } = render(<Surface data-testid="s">hi</Surface>);
    const node = screen.getByTestId('s');
    // `renderWithTheme` injects a <style> sibling, so compare parents rather than first child.
    expect(node.parentElement).toBe(container);
    expect(node.getAttribute('style') ?? '').not.toContain('--sds-palette-');
  });

  it('inverted wraps in a display:contents capture element', () => {
    const { container } = render(
      <Surface tone="inverted" data-testid="s">
        hi
      </Surface>,
    );
    const capture = screen.getByTestId('s').parentElement as HTMLElement;
    expect(capture).not.toBe(container);
    expect(capture.style.display).toBe('contents');
    expect(capture.style.getPropertyValue('--sds-surface-ink')).toBe(
      'var(--sds-palette-foreground-default)',
    );
  });

  it.each(['primary', 'secondary'] as const)(
    '%s adds no wrapper — the band is one element',
    (tone) => {
      const { container } = render(
        <Surface tone={tone} data-testid="s">
          hi
        </Surface>,
      );
      const node = screen.getByTestId('s');
      expect(node.parentElement).toBe(container);
      expect(node.style.getPropertyValue('--sds-palette-background-default')).toBe(
        `var(--sds-palette-${tone}-main)`,
      );
      expect(node.style.getPropertyValue('--sds-palette-foreground-default')).toBe(
        `var(--sds-palette-${tone}-contrast)`,
      );
    },
  );

  it('renders the semantic element asked for', () => {
    render(
      <Surface as="section" tone="primary" data-testid="s">
        hi
      </Surface>,
    );
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
  });

  it('a consumer style still wins over the tone map', () => {
    render(
      <Surface
        tone="primary"
        data-testid="s"
        style={{ '--sds-palette-background-default': 'rebeccapurple' } as never}
      >
        hi
      </Surface>,
    );
    expect(screen.getByTestId('s').style.getPropertyValue('--sds-palette-background-default')).toBe(
      'rebeccapurple',
    );
  });

  it('colorScheme overrides what the tone declares, for a pale brand fill', () => {
    render(
      <Surface tone="primary" colorScheme="light" data-testid="s">
        hi
      </Surface>,
    );
    // Inline wins over the recipe's `[color-scheme:dark]` class.
    expect(screen.getByTestId('s').style.colorScheme).toBe('light');
  });

  it('children need no on-dark props inside a brand band', () => {
    // The point of the feature: the button is written exactly as it would be on a white page.
    render(
      <Surface tone="primary">
        <Button color="neutral">Start free</Button>
      </Surface>,
    );
    const button = screen.getByRole('button', { name: 'Start free' });
    expect(button.getAttribute('style') ?? '').not.toContain('--sds-palette-');
  });
});

describe('Surface — nesting', () => {
  it('inverted inside a brand band captures the band ground, giving the light card', () => {
    // The inner capture element reads the *inherited* values, which the brand band has just
    // re-pointed at `contrast` / `main`. So the inner surface renders contrast-ground /
    // brand-ink — a white card on a violet band — with no third tone.
    render(
      <Surface tone="primary" data-testid="band">
        <Surface tone="inverted" data-testid="card">
          hi
        </Surface>
      </Surface>,
    );
    const band = screen.getByTestId('band');
    const card = screen.getByTestId('card');
    expect(band.contains(card)).toBe(true);

    const capture = card.parentElement as HTMLElement;
    expect(capture.style.display).toBe('contents');
    expect(band.contains(capture)).toBe(true);
    expect(capture.style.getPropertyValue('--sds-surface-paper')).toBe(
      'var(--sds-palette-background-default)',
    );
  });

  it('a brand band inside an inverted band re-grounds on the brand fill', () => {
    render(
      <Surface tone="inverted" data-testid="dark">
        <Surface tone="primary" data-testid="cta">
          hi
        </Surface>
      </Surface>,
    );
    const cta = screen.getByTestId('cta');
    expect(screen.getByTestId('dark').contains(cta)).toBe(true);
    // Reads the brand role, which `inverted` deliberately never touched — so it is unaffected by
    // sitting inside a dark band.
    expect(cta.style.getPropertyValue('--sds-palette-background-default')).toBe(
      'var(--sds-palette-primary-main)',
    );
  });

  it('two brand bands nest idempotently', () => {
    render(
      <Surface tone="primary" data-testid="outer">
        <Surface tone="primary" data-testid="inner">
          hi
        </Surface>
      </Surface>,
    );
    const outer = screen.getByTestId('outer');
    const inner = screen.getByTestId('inner');
    expect(inner.getAttribute('style')).toBe(outer.getAttribute('style'));
  });
});
