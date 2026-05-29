import type { ElementType } from 'react';
import type { TypographyVariant } from './Typography.types';

/**
 * Default intrinsic element rendered for each variant when neither `as` nor `actLike` is set.
 *
 * - `display` collapses to `<h1>` — the visual is bigger than `h1`, but semantically it's still
 *   a top-level heading.
 * - `h1`–`h6` map 1:1 onto their semantic counterparts.
 * - All body variants are paragraphs (`<p>`).
 * - `caption` / `overline` are inline spans (often appearing inside other paragraphs).
 * - `code` renders as the `<code>` element for the right native semantics + monospace fallback.
 *
 * Consumers can always override via `<Typography variant="h2" as="h1">…</Typography>` when the
 * visual hierarchy needs to differ from the document outline.
 */
export const VARIANT_TO_ELEMENT: Record<TypographyVariant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  bodyLarge: 'p',
  bodySmall: 'p',
  caption: 'span',
  overline: 'span',
  code: 'code',
};
