import type { CSSProperties } from 'react';

/**
 * Builds the edge-fade mask for a marquee container.
 *
 * Two stops in from each edge, fully opaque between them, so items dissolve into the surrounding
 * surface instead of being sliced by the container boundary — which is what makes a logo band
 * read as "continuing past the edge" rather than "cropped".
 *
 * `WebkitMaskImage` is emitted alongside the standard `maskImage` because Safari only un-prefixed
 * `mask-image` in 15.4, and the prefixed form is still what several in-support iOS versions read.
 * Without it the fade silently no-ops there: the marquee keeps working, it just clips again.
 *
 * Extracted as a pure function so the two-property contract is testable directly — jsdom's CSSOM
 * drops `-webkit-mask-image` entirely, so asserting it through a rendered element is impossible.
 */
export function fadeMask(axis: 'horizontal' | 'vertical', width: string): CSSProperties {
  const angle = axis === 'horizontal' ? 'to right' : 'to bottom';
  const gradient = `linear-gradient(${angle}, transparent 0, #000 ${width}, #000 calc(100% - ${width}), transparent 100%)`;
  return { maskImage: gradient, WebkitMaskImage: gradient };
}
