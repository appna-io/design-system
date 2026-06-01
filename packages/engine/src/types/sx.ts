import type { CSSProperties } from 'react';

/**
 * The `sx` prop is a theme-aware style object. It accepts:
 *  - any standard CSSProperties value
 *  - string values starting with a token path that the resolver converts to `var(--sds-…)`
 *
 * The runtime resolver (`sxToStyle`) walks the object and replaces token references.
 */
export type Sx = CSSProperties & {
  // allow theme-token aliases like `bg: 'primary.main'` — handled by the resolver
  [tokenKey: string]: string | number | undefined;
};