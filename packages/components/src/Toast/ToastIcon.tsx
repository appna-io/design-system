import { Loader2 } from 'lucide-react';
import { createElement, type ReactElement, type ReactNode } from 'react';

import { iconForColor } from '../_shared/iconForColor';
import type { ToastIntent } from './Toast.types';

/**
 * Intent → leading-icon resolver. Five of the six intents map onto `_shared/iconForColor`
 * directly (after the `error` → `danger` color rename — `error` is the toast spelling that
 * matches Sonner / react-hot-toast convention; the underlying color role is `danger`).
 *
 * `loading` doesn't have an entry in `iconForColor` (it's a pending state, not a status) so we
 * render a spinning `Loader2` here. CSS-only `animate-spin` honors `prefers-reduced-motion`
 * via the Tailwind preset's `motion-reduce` variant.
 */
const INTENT_TO_COLOR = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'danger',
} as const;

/**
 * Icon tint per intent. Lives here (not in `Toast.recipe.ts`) so the 6 entries don't get
 * inlined into 18 compound-variant rows on the content recipe. Repetition in the recipe is
 * gzipped-cheap *until* it crosses a dictionary-window threshold; pulling the icon color out
 * to a 6-entry map shaves ~250B from the final bundle.
 */
const ICON_COLOR_BY_INTENT: Record<ToastIntent, string> = {
  neutral: 'text-fg-muted',
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
  loading: 'text-fg-muted',
};

export interface ToastIconProps {
  intent: ToastIntent;
  /** When defined, overrides the default. `false` opts out of any icon. */
  override?: ReactNode | false;
}

export function ToastIcon({ intent, override }: ToastIconProps): ReactElement | null {
  if (override === false) return null;

  const tint = ICON_COLOR_BY_INTENT[intent];
  const baseCls = `flex shrink-0 items-center pt-0.5 [&_svg]:size-4 ${tint}`;

  if (override !== undefined) {
    return (
      <span data-toast-icon aria-hidden="true" className={baseCls}>
        {override}
      </span>
    );
  }

  if (intent === 'loading') {
    return (
      <span
        data-toast-icon
        aria-hidden="true"
        className={`${baseCls} [&_svg]:animate-spin motion-reduce:[&_svg]:animate-none`}
      >
        <Loader2 />
      </span>
    );
  }

  const Icon = iconForColor[INTENT_TO_COLOR[intent]];
  return (
    <span data-toast-icon aria-hidden="true" className={baseCls}>
      {createElement(Icon)}
    </span>
  );
}