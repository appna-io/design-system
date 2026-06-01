import type { AvatarHashableColor } from './Avatar.types';

/**
 * Ordered palette roles used by `color="auto"`. Order is intentional and stable: callers can
 * append a new role to the end without re-mapping existing names. Hash distribution remains
 * uniform because we always `% palette.length`.
 */
const HASH_PALETTE: readonly AvatarHashableColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

/**
 * Pure, deterministic mapping from a display name to one of the seven palette roles. Same input
 * always produces the same output across renders, sessions, and machines, which keeps each user's
 * fallback avatar visually consistent in lists, mentions, and revisits.
 *
 * Hash details:
 *   - Empty / undefined input → `'neutral'` (safe, no-op fallback color).
 *   - Otherwise: sum of UTF-16 code units mod palette length. djb2 would be marginally better at
 *     scattering but for the 7-bucket case the simpler sum is indistinguishable in practice and
 *     half the code.
 *
 * The returned value is intentionally narrowed to the seven *hashable* palette roles — `'auto'`
 * is a prop-level sentinel, not a real color, so callers can spread the result straight into the
 * recipe without runtime checks.
 */
export function hashColor(name: string | undefined): AvatarHashableColor {
  if (!name) return 'neutral';
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return HASH_PALETTE[sum % HASH_PALETTE.length] ?? 'neutral';
}