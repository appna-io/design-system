import type { CSSProperties } from 'react';
import type { DivProps } from '../Div';

/**
 * The 16 shipped variants. Headings (`h1`–`h6`) map onto their semantic counterparts; the four
 * `display*` variants are the oversize visual hero sizes; the three `body*` variants cover
 * paragraph density; the three supporting variants cover accent text (`caption`, `overline`,
 * `code`).
 *
 * `display` is fixed-size (3rem) and stays for product UI. `displayLg` / `displayXl` /
 * `display2Xl` are **fluid** — they scale continuously with the viewport instead of snapping at
 * breakpoints, which is what a marketing headline wants. Reach for `display2Xl` on a hero,
 * `displayXl` on a large section opener, `displayLg` where a heading should feel oversized
 * without dominating.
 */
export type TypographyVariant =
  | 'display'
  | 'displayMd'
  | 'displayLg'
  | 'displayXl'
  | 'display2Xl'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'code';

/** Typography token keys for the size axis. Falls back to any raw CSS value. */
export type TypographyFontSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | 'display-md'
  | 'display-lg'
  | 'display-xl'
  | 'display-2xl';

/** Typography token keys for the weight axis. Falls back to any numeric/CSS value. */
export type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/** Typography token keys for the line-height axis. Falls back to any numeric/CSS value. */
export type TypographyLineHeight = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed';

/** Typography token keys for the letter-spacing axis. Falls back to any raw CSS value. */
export type TypographyLetterSpacing = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';

/**
 * Typography token keys for the font-family axis. Falls back to any raw CSS value.
 *
 * `display` is the heading / brand face; it falls back to the sans stack when the theme doesn't
 * define one, so it is always safe to ask for.
 */
export type TypographyFontFamily = 'sans' | 'mono' | 'display';

/** Friendly `align` shortcut keys (mapped to `textAlign`). */
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

/** Friendly `transform` shortcut keys (mapped to `textTransform`). */
export type TypographyTransform = 'none' | 'upper' | 'lower' | 'capitalize';

/** Friendly `decoration` shortcut keys (mapped to `textDecoration`). */
export type TypographyDecoration = 'none' | 'underline' | 'line-through';

/**
 * The text-specific prop bag — everything `<Typography />` adds on top of `<Div />`.
 *
 * All five token-aware shorthand props accept **either** a documented token key (resolved into
 * the matching `var(--sds-...)` reference) **or** any raw CSS value (number / px string / etc.)
 * — the resolver bypasses the token table for unknown strings.
 */
export interface TypographyOwnProps {
  /** Visual + semantic variant. Default `'body'`. */
  variant?: TypographyVariant | undefined;
  /**
   * The **visual scale only**, with no element attached.
   *
   * `variant` drives two things — the type scale *and* the rendered element — so the most natural
   * way to ask for a size makes a semantic promise you never meant:
   *
   * ```tsx
   * <Typography variant="h4">{clientName}</Typography>   // emits a real <h4>
   * ```
   *
   * That shipped an `h1 → h4` skip and eight phantom subheadings on a page whose "headings" were
   * a list of company names. Nothing showed it: the file reads correctly, the design is right,
   * the tests pass. It is visible only in the rendered outline.
   *
   * So `size` is the same scale with the promise removed. It renders a `<span>` unless `as` says
   * otherwise, and the rule is short enough to remember:
   *
   * > **`variant` makes a semantic promise. `size` doesn't.**
   *
   * ```tsx
   * <Typography size="h4">{clientName}</Typography>      // h4's scale, no heading
   * <Typography variant="h4">{sectionTitle}</Typography> // an actual h4
   * ```
   */
  size?: TypographyVariant | undefined;

  /** Token (`'xs'`–`'5xl'`) or any raw CSS font-size value. */
  fontSize?: TypographyFontSize | (string & {}) | number | undefined;
  /** Friendly alias for `fontWeight`. Same token table; takes precedence over `fontWeight` if both supplied. */
  weight?: TypographyWeight | (string & {}) | number | undefined;
  /** Canonical name — also accepted. Token (`'normal'`–`'bold'`) or any raw CSS value. */
  fontWeight?: TypographyWeight | (string & {}) | number | undefined;
  /** Token (`'none'`–`'relaxed'`) or any raw CSS line-height value. */
  lineHeight?: TypographyLineHeight | (string & {}) | number | undefined;
  /** Token (`'tighter'`–`'wider'`) or any raw CSS letter-spacing value. */
  letterSpacing?: TypographyLetterSpacing | (string & {}) | undefined;
  /** Token (`'sans'` / `'mono'`) or any raw CSS font-family stack. */
  fontFamily?: TypographyFontFamily | (string & {}) | undefined;

  /** Shortcut for `fontStyle: 'italic'`. */
  italic?: boolean | undefined;
  /** Shortcut for `textAlign`. Friendly key set. */
  align?: TypographyAlign | undefined;
  /** Shortcut for `textTransform`. `'upper'` / `'lower'` are aliases for `'uppercase'` / `'lowercase'`. */
  transform?: TypographyTransform | undefined;
  /** Shortcut for `textDecoration`. */
  decoration?: TypographyDecoration | undefined;
  /** Single-line ellipsis. Injects `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`. */
  truncate?: boolean | undefined;
  /**
   * Multi-line ellipsis. Renders as `display: -webkit-box; -webkit-box-orient: vertical;
   * -webkit-line-clamp: N; overflow: hidden;`. Pass the maximum number of visible lines.
   */
  lineClamp?: number | undefined;
}

/**
 * Set of `DivProps` keys that `TypographyOwnProps` re-declares with narrower / friendlier types
 * (token-aware unions instead of bare CSSProperties values). They're omitted from the inherited
 * `DivProps` slice so the typography-specific declarations win without a TS conflict.
 */
type TypographyOverriddenDivKeys =
  | 'fontSize'
  | 'fontWeight'
  | 'fontFamily'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textAlign'
  | 'textTransform'
  | 'textDecoration'
  // `transform` is a Typography shortcut (textTransform alias). The CSS transform property
  // is still reachable via Div's `sx` or `style` — we don't expose it as a top-level prop
  // on Typography because the typography shortcut is the strongly-typed ergonomic the
  // primitive is meant to provide.
  | 'transform';

/**
 * Full prop surface for `<Typography />` (and the `Text` alias). Inherits **every** prop `<Div />`
 * accepts (CSS shorthand, pseudo hooks, `as` / `actLike` / `asChild`, `centered`, `hideOn`,
 * `displayOn`, `animation`, HTML pass-through) except the small set of typography-axis CSS
 * shorthand keys that Typography re-declares with token-aware unions (see
 * `TypographyOverriddenDivKeys`).
 */
export interface TypographyProps
  extends TypographyOwnProps,
    Omit<DivProps, TypographyOverriddenDivKeys> {
  /** Restate consumer style override — wins over the Typography-specific style chunk. */
  style?: CSSProperties | undefined;
}