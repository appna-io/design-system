import type { SVGProps } from 'react';

/**
 * Tiny "remove" glyph used by `<Badge removable>`. Inline so the component never imports an icon
 * library — keeps the Badge bundle delta under the 1.5 KB budget. Inherits `currentColor` so the
 * stroke automatically matches whatever palette role the badge is rendering.
 */
export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      {...props}
    >
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}
