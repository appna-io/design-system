/**
 * `<Surface>` — the region primitive that establishes its own ground (#10).
 *
 * The thing under test is a *token* swap, and JSDOM applies no stylesheets and does not evaluate
 * `color-mix`, so these assert the contract at the level it is actually expressed: which custom
 * properties are set, on which element, and in terms of what. Anything that reads them
 * (`Typography`, `Input`, `Button`) then follows by construction — that is the whole design.
 *
 * The failure modes each test guards against are specific:
 *
 *   1. **The cycle.** Assigning background from foreground *and* foreground from background on
 *      one element is a custom-property cycle; CSS discards every property in it, so the surface
 *      would render completely unstyled with no error anywhere. The two-element split is the fix,
 *      so the split itself is pinned.
 *   2. **Hard-coded colours.** If the inverted values ever stop being expressed in terms of the
 *      captured pair, Surface silently stops composing with a scoped brand theme — it would look
 *      right on the DS default and wrong on every brand.
 *   3. **Over-inversion.** Inverting the chromatic roles would make a danger button pale on a
 *      dark band. `neutral` inverts (it is the surface role); the rest must not.
 */

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Surface } from '../src/Surface';
import { invertedPaletteVars, surfaceCaptureVars } from '../src/Surface';
import { renderWithTheme } from './utils';

function surfaceEl(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-testid="surface"]');
  if (!el) throw new Error('surface not rendered');
  return el;
}

describe('Surface — default tone', () => {
  it('paints the ambient ground and adds no wrapper', () => {
    const { container } = renderWithTheme(
      <Surface data-testid="surface">
        <span>content</span>
      </Surface>,
    );
    const el = surfaceEl(container);
    expect(el.className).toContain('bg-bg');
    expect(el.className).toContain('text-fg');
    // Nothing is being swapped, so there is no cycle to break — don't put an element in the
    // consumer's tree for nothing.
    expect(el.parentElement).toBe(container);
  });

  it('sets no palette variables', () => {
    const { container } = renderWithTheme(<Surface data-testid="surface">x</Surface>);
    expect(surfaceEl(container).getAttribute('style') ?? '').not.toContain('--sds-palette');
  });
});

describe('Surface — inverted tone', () => {
  it('renders a display:contents capture element that freezes the outer palette', () => {
    const { container } = renderWithTheme(
      <Surface tone="inverted" data-testid="surface">
        x
      </Surface>,
    );
    const capture = surfaceEl(container).parentElement!;

    expect(capture.style.display).toBe('contents');
    expect(capture.style.getPropertyValue('--sds-surface-ink')).toBe(
      'var(--sds-palette-foreground-default)',
    );
    expect(capture.style.getPropertyValue('--sds-surface-paper')).toBe(
      'var(--sds-palette-background-default)',
    );
  });

  it('swaps ground and ink on the surface itself, reading only the captured pair', () => {
    const { container } = renderWithTheme(
      <Surface tone="inverted" data-testid="surface">
        x
      </Surface>,
    );
    const s = surfaceEl(container).style;

    expect(s.getPropertyValue('--sds-palette-background-default')).toBe('var(--sds-surface-ink)');
    expect(s.getPropertyValue('--sds-palette-background-paper')).toBe('var(--sds-surface-ink)');
    expect(s.getPropertyValue('--sds-palette-foreground-default')).toBe(
      'var(--sds-surface-paper)',
    );
  });

  it('is expressed entirely in terms of the captured pair — never a literal colour', () => {
    // This is what makes it compose with a scoped brand theme. A hex or an rgb() creeping in here
    // would look correct on the DS default and wrong on every brand palette, silently.
    for (const [name, value] of Object.entries(invertedPaletteVars)) {
      expect(String(value), name).toMatch(/var\(--sds-surface-(ink|paper)\)/);
      expect(String(value), name).not.toMatch(/#[0-9a-f]{3}|rgba?\(|hsla?\(/i);
    }
  });

  it('inverts the neutral role but leaves the chromatic roles alone', () => {
    const names = Object.keys(invertedPaletteVars);

    // Neutral is the surface/chrome role — it has to invert, and that is what makes
    // `<Button color="neutral">` the light-on-dark button a dark band wants.
    expect(names).toContain('--sds-palette-neutral-main');
    expect(names).toContain('--sds-palette-neutral-contrast');

    // Brand and status colours must stay recognisable. A pale danger button is a bug.
    for (const role of ['primary', 'secondary', 'success', 'warning', 'danger', 'info']) {
      expect(names.some((n) => n.startsWith(`--sds-palette-${role}-`)), role).toBe(false);
    }
  });

  it('re-points the focus ring, which is tuned for a light ground', () => {
    expect(invertedPaletteVars['--sds-focus-ring' as keyof typeof invertedPaletteVars]).toBe(
      'var(--sds-surface-paper)',
    );
  });

  it('sets color-scheme so form-control internals render for a dark ground', () => {
    // Not a token — the caret, select arrow, scrollbars and autofill are UA-drawn. Without this
    // a text input inside a dark band gets a black caret on a black field.
    const { container } = renderWithTheme(
      <Surface tone="inverted" data-testid="surface">
        x
      </Surface>,
    );
    expect(surfaceEl(container).className).toContain('[color-scheme:dark]');
  });

  it('captures on the outer element and assigns on the inner — never both on one', () => {
    // The cycle guard. `--a: var(--b)` next to `--b: var(--a)` on a single element makes both
    // invalid at computed-value time and the surface renders unstyled, with no error.
    const { container } = renderWithTheme(
      <Surface tone="inverted" data-testid="surface">
        x
      </Surface>,
    );
    const el = surfaceEl(container);
    const capture = el.parentElement!;

    const captureNames = Object.keys(surfaceCaptureVars);
    const assignNames = Object.keys(invertedPaletteVars);
    expect(captureNames.some((n) => assignNames.includes(n))).toBe(false);

    for (const n of captureNames) expect(el.style.getPropertyValue(n)).toBe('');
    for (const n of assignNames) expect(capture.style.getPropertyValue(n)).toBe('');
  });
});

describe('Surface — composition', () => {
  it('renders the requested element so a band can be a landmark', () => {
    renderWithTheme(
      <Surface as="section" aria-label="Newsletter" tone="inverted">
        x
      </Surface>,
    );
    expect(screen.getByRole('region', { name: 'Newsletter' }).tagName).toBe('SECTION');
  });

  it('nests — an inner inverted surface captures the outer inverted palette', () => {
    // Two inversions cancel: the inner capture reads the *current* (already inverted) values, so
    // a light card inside a dark band needs no special casing.
    const { container } = renderWithTheme(
      <Surface tone="inverted" data-testid="outer">
        <Surface tone="inverted" data-testid="surface">
          x
        </Surface>
      </Surface>,
    );
    const innerCapture = surfaceEl(container).parentElement!;
    expect(innerCapture.style.getPropertyValue('--sds-surface-ink')).toBe(
      'var(--sds-palette-foreground-default)',
    );
  });

  it('lets a caller override a single token — their style is merged last', () => {
    const { container } = renderWithTheme(
      <Surface tone="inverted" data-testid="surface" style={{ paddingBlock: '2rem' }}>
        x
      </Surface>,
    );
    const s = surfaceEl(container).style;
    expect(s.paddingBlock).toBe('2rem');
    // …without losing the inversion.
    expect(s.getPropertyValue('--sds-palette-foreground-default')).toBe(
      'var(--sds-surface-paper)',
    );
  });

  it('forwards arbitrary props and children through', () => {
    renderWithTheme(
      <Surface tone="inverted" id="band" data-testid="surface">
        <span>inside</span>
      </Surface>,
    );
    expect(screen.getByTestId('surface').id).toBe('band');
    expect(screen.getByText('inside')).toBeInTheDocument();
  });
});
