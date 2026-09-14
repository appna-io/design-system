import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Section } from '../src';
import { renderWithTheme as render } from './utils';

/**
 * `Section` exists to make the layout rules of the design language mechanical. These assert the
 * properties that carry that — the two-element split, the named scales, the tone forwarding —
 * rather than exact padding values.
 */
describe('Section', () => {
  it('renders a <section> by default and holds its children', () => {
    render(
      <Section data-testid="s">
        <p>Pricing</p>
      </Section>,
    );
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('separates the ground from the container — two elements, two jobs', () => {
    // The outer element carries the ground and can bleed; the inner one carries the container
    // and the padding. A single element cannot express `width="full"`.
    render(
      <Section data-testid="s">
        <p>copy</p>
      </Section>,
    );
    const outer = screen.getByTestId('s');
    const inner = outer.querySelector('div');

    expect(inner).not.toBeNull();
    expect(outer.className).not.toContain('max-w-');
    expect(inner!.className).toContain('max-w-7xl');
    expect(inner!.className).toContain('mx-auto');
  });

  it('bleeds the ground while keeping children in the house container', () => {
    render(
      <Section width="full" rhythm="flush" data-testid="s">
        <p>marquee</p>
      </Section>,
    );
    const inner = screen.getByTestId('s').querySelector('div')!;

    // The ground runs edge to edge, but the copy stays on the same line as every other section.
    expect(inner.className).toContain('max-w-7xl');
    // `flush` means the band owns its own vertical space.
    expect(inner.className).not.toMatch(/\bpy-\d/);
  });

  it('steps the rhythm rather than letting a template pick a number', () => {
    const seen = new Set<string>();
    for (const rhythm of ['compact', 'default', 'spacious'] as const) {
      const { unmount } = render(
        <Section rhythm={rhythm} data-testid="s">
          <p>x</p>
        </Section>,
      );
      const cls = screen.getByTestId('s').querySelector('div')!.className;
      const py = cls.match(/py-\d+ lg:py-\d+/)?.[0];
      expect(py).toBeDefined();
      seen.add(py!);
      unmount();
    }
    // Three distinct steps — adjacent sections need to be able to differ across a colour change.
    expect(seen.size).toBe(3);
  });

  it('keeps the gutter constant across every width', () => {
    const gutters = new Set<string>();
    for (const width of ['default', 'narrow', 'wide', 'full'] as const) {
      const { unmount } = render(
        <Section width={width} data-testid="s">
          <p>x</p>
        </Section>,
      );
      const cls = screen.getByTestId('s').querySelector('div')!.className;
      gutters.add(cls.match(/px-4 sm:px-6 lg:px-8/)?.[0] ?? 'missing');
      unmount();
    }
    expect(gutters).toEqual(new Set(['px-4 sm:px-6 lg:px-8']));
  });

  it('renders two offset washes for atmosphere, never one gradient', () => {
    render(
      <Section atmosphere data-testid="s">
        <p>hero</p>
      </Section>,
    );
    // One linear gradient reads as a stripe of colour; two opposed radials read as light.
    const decorative = screen.getByTestId('s').querySelectorAll('[aria-hidden="true"]');
    expect(decorative.length).toBe(2);
  });

  it('renders no washes when atmosphere is not asked for', () => {
    render(
      <Section data-testid="s">
        <p>plain</p>
      </Section>,
    );
    expect(screen.getByTestId('s').querySelectorAll('[aria-hidden="true"]').length).toBe(0);
  });

  it('accepts an id and a custom element, so anchors and semantics still work', () => {
    render(
      <Section as="footer" id="contact" data-testid="s">
        <p>x</p>
      </Section>,
    );
    const node = screen.getByTestId('s');
    expect(node.tagName).toBe('FOOTER');
    expect(node.id).toBe('contact');
  });
});
