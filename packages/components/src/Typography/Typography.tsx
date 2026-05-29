'use client';

import { cn, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { type CSSProperties } from 'react';

import { Div } from '../Div';
import { typographyRecipe } from './Typography.recipe';
import type {
  TypographyAlign,
  TypographyDecoration,
  TypographyProps,
  TypographyTransform,
} from './Typography.types';
import { resolveTypographyToken } from './typographyTokens';
import { VARIANT_TO_ELEMENT } from './variantElement';

/**
 * Shortcut maps for the three friendly enum props. Inline objects so the bundler can constant-
 * fold + dead-code-eliminate any branch consumers don't hit.
 */
const ALIGN_MAP: Record<TypographyAlign, CSSProperties['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
};

const TRANSFORM_MAP: Record<TypographyTransform, CSSProperties['textTransform']> = {
  none: 'none',
  upper: 'uppercase',
  lower: 'lowercase',
  capitalize: 'capitalize',
};

const DECORATION_MAP: Record<TypographyDecoration, CSSProperties['textDecoration']> = {
  none: 'none',
  underline: 'underline',
  'line-through': 'line-through',
};

/** Single-line ellipsis. Shared frozen object so every truncated render reuses it. */
const TRUNCATE_STYLE: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Multi-line clamp. Returns a fresh object each call because `WebkitLineClamp` is unique per N.
 * The `-webkit-` flexbox combo is the only cross-browser-supported way to do multi-line ellipsis
 * today; Firefox + Safari + Chrome all honor it despite the vendor prefix.
 */
function lineClampStyle(n: number): CSSProperties {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: n,
    overflow: 'hidden',
  };
}

/**
 * `<Typography />` — the DS's canonical text primitive.
 *
 * Composes `<Div />` for **all** layout / color / pseudo / animation / polymorphism / HTML
 * pass-through behavior, then layers the text-specific surface on top:
 *
 *   1. **Variant recipe** — `cv()` returns a Tailwind class string per variant
 *      (`display`, `h1`–`h6`, `body*`, `caption`, `overline`, `code`).
 *   2. **Variant → element mapping** — `h1` → `<h1>`, `body` → `<p>`, `caption` → `<span>`,
 *      `code` → `<code>`, etc. Consumers override with `as` / `actLike` when the visual rank
 *      should differ from the document outline.
 *   3. **Typography-token resolution** — `fontSize="lg"` → `var(--sds-font-size-lg)`. The five
 *      type-specific props (`fontSize`, `fontWeight`/`weight`, `lineHeight`, `letterSpacing`,
 *      `fontFamily`) all run through the same resolver; numbers and raw CSS strings pass through.
 *   4. **Text-friendly shortcuts** — `italic`, `align`, `transform`, `decoration`, `truncate`,
 *      `lineClamp` each compile down to one or three CSS keys.
 *
 * The text-specific style chunk is merged **before** the consumer's `style` prop and **before**
 * the Div is told about it, so:
 *
 *   recipe class < Div sx < Div curated shorthand < Typography text style < consumer style
 *
 * `Text` is exported as an alias of `Typography` (same reference) for ergonomic call sites.
 *
 * @example
 *   <Typography variant="h1">Page title</Typography>
 *   <Typography variant="body" color="fg.muted">Subtle body copy</Typography>
 *   <Typography fontSize="2xl" weight="semibold">Custom size + weight</Typography>
 *   <Typography truncate>Long text…</Typography>
 *   <Typography lineClamp={3}>Multi-line clamped text…</Typography>
 *   <Typography variant="caption" italic align="center">Centered italic caption</Typography>
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  props,
  ref,
) {
  const {
    variant = 'body',
    as,
    actLike,
    fontSize,
    fontWeight,
    weight,
    lineHeight,
    letterSpacing,
    fontFamily,
    italic,
    align,
    transform,
    decoration,
    truncate,
    lineClamp,
    className,
    style,
    ...rest
  } = props;

  // Recipe → variant class string. We pass `className: undefined` here and merge the consumer
  // className ourselves below so the precedence stays predictable (recipe → consumer className).
  const { className: recipeCls } = useThemedClasses({
    recipe: typographyRecipe,
    componentName: 'Typography',
    props: { variant, className: undefined, sx: undefined, style: undefined },
  });

  // Build the typography-specific inline-style chunk. Each key is added only when its source
  // prop is defined, so we never overwrite Div's downstream `style` cascade with `undefined`.
  // The `weight` alias wins over `fontWeight` when both are supplied (documented behavior).
  const textStyle: Record<string, string | number | undefined> = {};

  const resolvedFontSize = resolveTypographyToken('fontSize', fontSize);
  if (resolvedFontSize !== undefined) textStyle.fontSize = resolvedFontSize;

  const weightInput = weight !== undefined ? weight : fontWeight;
  const resolvedWeight = resolveTypographyToken('fontWeight', weightInput);
  if (resolvedWeight !== undefined) textStyle.fontWeight = resolvedWeight;

  const resolvedLineHeight = resolveTypographyToken('lineHeight', lineHeight);
  if (resolvedLineHeight !== undefined) textStyle.lineHeight = resolvedLineHeight;

  const resolvedLetterSpacing = resolveTypographyToken('letterSpacing', letterSpacing);
  if (resolvedLetterSpacing !== undefined) textStyle.letterSpacing = resolvedLetterSpacing;

  const resolvedFontFamily = resolveTypographyToken('fontFamily', fontFamily);
  if (resolvedFontFamily !== undefined) textStyle.fontFamily = resolvedFontFamily;

  if (italic) textStyle.fontStyle = 'italic';
  if (align) textStyle.textAlign = ALIGN_MAP[align];
  if (transform) textStyle.textTransform = TRANSFORM_MAP[transform];
  if (decoration) textStyle.textDecoration = DECORATION_MAP[decoration];

  // `truncate` and `lineClamp` are mutually exclusive presentation modes — when both are set
  // we keep `lineClamp` (the strictly more informative one) and skip the single-line styles.
  if (lineClamp !== undefined) {
    Object.assign(textStyle, lineClampStyle(lineClamp));
  } else if (truncate) {
    Object.assign(textStyle, TRUNCATE_STYLE);
  }

  // Consumer's `style` always wins via Object.assign order.
  const mergedStyle: CSSProperties | undefined =
    Object.keys(textStyle).length > 0 || style
      ? ({ ...textStyle, ...(style ?? {}) } as CSSProperties)
      : undefined;

  // Element pick: consumer-supplied `as`/`actLike` wins over the variant default (Div's existing
  // `actLike` > `as` dev-warning machinery kicks in if both are present).
  const variantElement = VARIANT_TO_ELEMENT[variant];
  const elementForDiv = actLike ?? as ?? variantElement;

  return (
    <Div
      ref={ref}
      as={elementForDiv}
      className={cn(recipeCls, className)}
      style={mergedStyle}
      {...rest}
    />
  );
}, 'Typography');

/**
 * `Text` — alias of `Typography`. Same component reference, same render, shorter call site.
 * Use whichever name reads better in your file (`<Typography variant="h1" />` for layout
 * narratives, `<Text variant="caption" />` for inline metadata).
 */
export const Text = Typography;
