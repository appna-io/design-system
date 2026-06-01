import type { SVGProps } from 'react';

/**
 * Default icon-only fallback used when `<Avatar>` has neither `src` nor `name`. Stays inline so
 * the Avatar bundle never pulls in `lucide-react` for the most common case — keeps the delta
 * comfortably under the 3.5 KB gzipped budget.
 *
 * The glyph inherits `currentColor` so it picks up the variant/color text token chosen by the
 * recipe (e.g. `text-primary-contrast` for `solid` + `primary`).
 */
export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      {...props}
    >
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}