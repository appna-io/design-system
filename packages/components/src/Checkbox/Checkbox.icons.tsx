import type { SVGProps } from 'react';

/**
 * Inline check glyph rendered inside the checked indicator. Stroke uses `currentColor` so the
 * recipe's per-variant `text-*` class drives the color. Sized via the parent's `[&_svg]:size-*`
 * compound rule — never reads its own pixel dimensions.
 */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 6.2l2.5 2.5 4.5-4.7" />
    </svg>
  );
}

/**
 * Inline horizontal-bar glyph rendered inside the indeterminate indicator. Same sizing /
 * coloring discipline as `CheckIcon`.
 */
export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M3 6h6" />
    </svg>
  );
}
